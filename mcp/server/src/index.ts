import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { graph } from "./msgraph.js";

// création du serveur mcp !
const server = new McpServer({
    name: "learn-mcp-server",
    version: "1.0.0"
});

server.registerTool(
    "getUserProfile",
    {
        title: "Get User Profile",
        description: "Récupère le profil de l'utilisateur connecté",
        inputSchema: {
            accessToken: z.string()
        },
    },
    async ({ accessToken }) => {
        try {
            const user = await graph.getUserProfile(accessToken);
            return {
                content: [{ 
                    type: "text", 
                    text: `User: ${user.displayName} (${user.userPrincipalName})` 
                }],
                structuredContent: user
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getSites",
    {
        title: "Get SharePoint Sites",
        description: "Récupère la liste des sites SharePoint",
        inputSchema: {
            accessToken: z.string(),
            search: z.string().optional()
        },
    },
    async ({ accessToken, search }) => {
        try {
            const sites = await graph.getSites(accessToken, search);
            return {
                content: [{ 
                    type: "text", 
                    text: `Found ${sites.length} site(s)` 
                }],
                structuredContent: { sites, count: sites.length }
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getSiteById",
    {
        title: "Get Site By ID",
        description: "Récupère un site SharePoint par son ID",
        inputSchema: {
            accessToken: z.string(),
            siteId: z.string()
        },
    },
    async ({ accessToken, siteId }) => {
        try {
            const site = await graph.getSiteById(accessToken, siteId);
            return {
                content: [{ 
                    type: "text", 
                    text: `Site: ${site.displayName}` 
                }],
                structuredContent: site
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getSiteByUrl",
    {
        title: "Get Site By URL",
        description: "Récupère un site SharePoint par son URL",
        inputSchema: {
            accessToken: z.string(),
            hostname: z.string(),
            serverRelativeUrl: z.string()
        },
    },
    async ({ accessToken, hostname, serverRelativeUrl }) => {
        try {
            const site = await graph.getSiteByUrl(accessToken, hostname, serverRelativeUrl);
            return {
                content: [{ 
                    type: "text", 
                    text: `Site: ${site.displayName}` 
                }],
                structuredContent: site
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);


server.registerTool(
    "getRootSite",
    {
        title: "Get Root Site",
        description: "Récupère le site racine SharePoint",
        inputSchema: {
            accessToken: z.string()
        },
    },
    async ({ accessToken }) => {
        try {
            const site = await graph.getRootSite(accessToken);
            return {
                content: [{ 
                    type: "text", 
                    text: `Root Site: ${site.displayName}` 
                }],
                structuredContent: site
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getSiteLists",
    {
        title: "Get Site Lists",
        description: "Récupère les listes d'un site SharePoint",
        inputSchema: {
            accessToken: z.string(),
            siteId: z.string()
        },
    },
    async ({ accessToken, siteId }) => {
        try {
            const lists = await graph.getSiteLists(accessToken, siteId);
            return {
                content: [{ 
                    type: "text", 
                    text: `Found ${lists.length} list(s)` 
                }],
                structuredContent: { lists, count: lists.length }
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getListById",
    {
        title: "Get List By ID",
        description: "Récupère une liste SharePoint par son ID",
        inputSchema: {
            accessToken: z.string(),
            siteId: z.string(),
            listId: z.string()
        },
    },
    async ({ accessToken, siteId, listId }) => {
        try {
            const list = await graph.getListById(accessToken, siteId, listId);
            return {
                content: [{ 
                    type: "text", 
                    text: `List: ${list.displayName || list.name}` 
                }],
                structuredContent: list
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

server.registerTool(
    "getListColumns",
    {
        title: "Get List Columns",
        description: "Récupère les colonnes d'une liste SharePoint",
        inputSchema: {
            accessToken: z.string(),
            siteId: z.string(),
            listId: z.string()
        },
    },
    async ({ accessToken, siteId, listId }) => {
        try {
            const columns = await graph.getListColumns(accessToken, siteId, listId);
            return {
                content: [{
                    type: "text", 
                    text: `Found ${columns.length} column(s)` 
                }],
                structuredContent: { columns, count: columns.length }
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

await server.connect(new StdioServerTransport());