import "server-only";

import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import https from "node:https";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured in environment variables");
}

// In local/sandbox environments where IPv6 is unroutable, Node's undici fetch times out.
// neonConfig.fetchFunction with an explicit IPv4 agent ensures instant, stable HTTP connections.
if (!neonConfig.fetchFunction) {
  neonConfig.fetchFunction = (
    url: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      const parsed = new URL(urlStr);
      const agent = new https.Agent({ family: 4, keepAlive: false });
      const req = https.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || 443,
          path: parsed.pathname + parsed.search,
          method: init?.method || "GET",
          headers: init?.headers as Record<string, string>,
          agent: agent,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            const body = Buffer.concat(chunks).toString("utf8");
            resolve({
              ok:
                res.statusCode !== undefined &&
                res.statusCode >= 200 &&
                res.statusCode < 300,
              status: res.statusCode ?? 500,
              statusText: res.statusMessage ?? "",
              headers: new Headers(res.headers as Record<string, string>),
              json: async () => JSON.parse(body),
              text: async () => body,
            } as Response);
          });
        }
      );
      req.on("error", reject);
      if (init?.body) {
        req.write(init.body as unknown as string);
      }
      req.end();
    });
  };
}

export const db = drizzle(databaseUrl);
export { schema };
