import { getRequestListener } from "@hono/node-server";
import honoApp from "../build/server/index.js";

// Vercel expects a standard Node.js HTTP handler
export default getRequestListener(honoApp.fetch);
