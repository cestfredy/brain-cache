import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import readline from "readline/promises";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";
if (!GEMINI_API_KEY || !MODEL) throw new Error("Missing GEMINI_API_KEY");

class MCPGeminiClient {
  constructor() {
    this.mcp = new Client({ name: "learn-mcp-client", version: "1.0.0" });
    this.gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    this.transport = null;
    this.tools = [];
  }

  async connectToServer(serverScriptPath) {
    this.transport = new StdioClientTransport({
      command: "node",
      args: ["../server/dist/index.js"],
    });

    await this.mcp.connect(this.transport);

    const toolsResult = await this.mcp.listTools();

    this.tools = toolsResult.tools.map((tool) => {
      const zodSchema = tool.inputSchema;
      const properties = {};
      const required = [];

      if (zodSchema && zodSchema.properties) {
        for (const [key, value] of Object.entries(zodSchema.properties)) {
          properties[key] = {
            type: this.mapZodType(value),
            description: value.description || key
          };
          
          if (!zodSchema.properties[key].isOptional) {
            required.push(key);
          }
        }
      }

      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: "object",
          properties,
          required
        }
      };
    });

    console.log("Tools connectés:", this.tools.length);
    console.log(JSON.stringify(this.tools, null, 2));
  }

  mapZodType(zodSchema) {
    if (zodSchema._def?.typeName === "ZodString" || zodSchema.type === "string") {
      return "string";
    }
    if (zodSchema._def?.typeName === "ZodNumber" || zodSchema.type === "number") {
      return "number";
    }
    if (zodSchema._def?.typeName === "ZodBoolean" || zodSchema.type === "boolean") {
      return "boolean";
    }
    if (zodSchema._def?.typeName === "ZodEnum" || zodSchema.enum) {
      return "string";
    }
    return "string";
  }

  async processQuery(query) {
    let contents = [
      {
        role: "user",
        parts: [
          {
            text: query
          }
        ]
      }
    ];

    let iteration = 0;
    const maxIterations = 10;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`\n--- Iteration ${iteration} ---`);

      const result = await this.gemini.models.generateContent({
        model: MODEL,
        contents,
        tools: this.tools
      });

      const candidate = result.candidates?.[0];
      if (!candidate) {
        return "Aucune réponse générée";
      }

      const parts = candidate.content?.parts || [];
      console.log("Parts reçus:", parts.length);
  
      const toolCallPart = parts.find((p) => p.functionCall);

      if (!toolCallPart) {
        const textResponse = parts.map((p) => p.text || "").join("");
        return textResponse || "Réponse vide";
      }

      const { name, args } = toolCallPart.functionCall;
      console.log(`Appel de l'outil: ${name}`, args);

      try {
        const toolResult = await this.mcp.callTool({
          name,
          arguments: args
        });

        console.log("Résultat de l'outil:", toolResult);

        const responseContent = toolResult.content?.[0]?.text || 
                               JSON.stringify(toolResult.structuredContent) || 
                               JSON.stringify(toolResult);

        contents.push(
          {
            role: "model",
            parts: [{ functionCall: { name, args } }]
          },
          {
            role: "user",
            parts: [
              {
                functionResponse: {
                  name,
                  response: { result: responseContent }
                }
              }
            ]
          }
        );
      } catch (error) {
        console.error("Erreur lors de l'appel de l'outil:", error);
        return `Erreur: ${error.message}`;
      }
    }

    return "Limite d'itérations atteinte";
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("\n🚀 MCP Gemini Client Ready");
    console.log("Tapez 'quit' pour quitter\n");

    while (true) {
      const query = await rl.question("Query: ");
      if (query.toLowerCase() === "quit") break;

      try {
        const response = await this.processQuery(query);
        console.log("\n✨ Réponse:", response, "\n");
      } catch (error) {
        console.error("\n❌ Erreur:", error.message, "\n");
      }
    }

    rl.close();
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  const client = new MCPGeminiClient();

  try {
    await client.connectToServer();
    await client.chatLoop();
  } finally {
    await client.cleanup();
  }
}

main();
