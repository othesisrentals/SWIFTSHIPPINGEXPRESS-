import { getRequestListener } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const honoAppPath = path.resolve(__dirname, "../build/server/index.js");

let honoHandler;

async function loadHandler() {
  if (!honoHandler) {
    const honoApp = (await import(honoAppPath)).default;
    honoHandler = getRequestListener(honoApp.fetch);
  }
  return honoHandler;
}

export default async function (req, res) {
  const handler = await loadHandler();
  return handler(req, res);
}
