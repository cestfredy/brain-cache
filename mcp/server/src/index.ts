import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "learn-mcp-server",
    version: "1.0.0"
});

server.registerTool(
    "calculator",
    {
        title: "Calculator",
        description: "Effectue des opérations mathématiques simples (+, -, *, /)",
        inputSchema: z.object({
            operation: z.enum(["add", "subtract", "multiply", "divide"]),
            a: z.number(),
            b: z.number()
        })
    },
    async ({ operation, a, b }) => {
        try {
            let result: number;
            
            switch (operation) {
                case "add":
                    result = a + b;
                    break;
                case "subtract":
                    result = a - b;
                    break;
                case "multiply":
                    result = a * b;
                    break;
                case "divide":
                    if (b === 0) throw new Error("Division par zéro impossible");
                    result = a / b;
                    break;
            }

            return {
                content: [{ 
                    type: "text", 
                    text: `Résultat: ${a} ${operation} ${b} = ${result}` 
                }]
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Erreur: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "randomText",
    {
        title: "Random Text Generator",
        description: "Génère un texte aléatoire selon un template",
        inputSchema: z.object({
            type: z.enum(["greeting", "quote", "fact"])
        })
    },
    async ({ type }) => {
        const data = {
            greeting: [
                "Bonjour ! Comment puis-je vous aider ?",
                "Salut ! Ravi de vous voir !",
                "Hello ! Que puis-je faire pour vous ?"
            ],
            quote: [
                "Le succès est un voyage, pas une destination.",
                "Chaque jour est une nouvelle opportunité.",
                "L'échec est le fondement du succès."
            ],
            fact: [
                "Les pieuvres ont trois cœurs.",
                "Le miel ne périme jamais.",
                "Un jour sur Vénus dure plus longtemps qu'une année."
            ]
        };

        const items = data[type];
        const random = items[Math.floor(Math.random() * items.length)] || "Aucun élément disponible";

        return {
            content: [{ 
                type: "text", 
                text: random
            }]
        };
    }
);

server.registerTool(
    "validateEmail",
    {
        title: "Email Validator",
        description: "Vérifie si un email est valide (format basique)",
        inputSchema: z.object({
            email: z.string()
        })
    },
    async ({ email }) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);

        return {
            content: [{ 
                type: "text", 
                text: isValid 
                    ? `✅ L'email "${email}" est valide` 
                    : `❌ L'email "${email}" n'est pas valide`
            }]
        };
    }
);

server.registerResource(
    "countries",
    "data://countries",
    {
        description: "Une liste de pays avec leurs capitales",
        mimeType: "application/json"
    },
    async () => {
        const countries = [
            { name: "France", capital: "Paris", population: 67000000 },
            { name: "Cameroun", capital: "Yaoundé", population: 27000000 },
            { name: "Canada", capital: "Ottawa", population: 38000000 },
            { name: "Japon", capital: "Tokyo", population: 125000000 }
        ];

        return {
            contents: [{
                uri: "data://countries",
                mimeType: "application/json",
                text: JSON.stringify(countries, null, 2)
            }]
        };
    }
);

server.registerPrompt(
    "analyze-data",
    {
        title: "Analyse de Données",
        description: "Génère un prompt pour analyser des données",
        argsSchema: {
            dataType: z.string().describe("Type de données à analyser"),
            focus: z.string().optional().describe("Aspect à analyser en priorité")
        }
    },
    async ({ dataType, focus }) => {
        const focusText = focus ? ` avec un focus sur ${focus}` : "";
        
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Analyse les données de type "${dataType}"${focusText}. Fournis un résumé clair avec les points clés, tendances et recommandations.`
                    }
                }
            ]
        };
    }
);

server.registerPrompt(
    "code-helper",
    {
        title: "Assistant Code",
        description: "Génère un prompt pour obtenir de l'aide en programmation",
        argsSchema: {
            language: z.string().describe("Langage de programmation"),
            task: z.string().describe("Tâche à accomplir")
        }
    },
    async ({ language, task }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `En ${language}, écris du code pour: ${task}. Inclus des commentaires explicatifs et des bonnes pratiques.`
                    }
                }
            ]
        };
    }
);

await server.connect(new StdioServerTransport());