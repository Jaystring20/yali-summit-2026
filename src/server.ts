import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  default: { fetch: (request: Request) => Promise<Response> | Response };
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry") as Promise<ServerEntry>;
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request) {
    try {
      const handler = await getServerEntry();
      return await handler.default.fetch(request);
    } catch (error) {
      console.error(consumeLastCapturedError() ?? error);
      return brandedErrorResponse();
    }
  },
};
