import * as React from "react";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { encode } from "turbo-stream";

import App from "./app.js";
import StreamInliner from "./stream-inliner.js";
import { renderToReadableStream } from "./react-web-shim.js";

function loadData(recurse = true): any {
  return {
    title: "turbo-stream + react",
    renderedAt: new Date(),
    set: new Set(["turbo-stream + react", "b"]),
    map: new Map([["turbo-stream + react", "b"]]),
    promise: recurse ? Promise.resolve(loadData(false)) : undefined,
  };
}

const app = new Hono();
app.use(
  "*",
  serveStatic({
    root: "./public",
  })
);

app.all("*", async () => {
  const data = loadData();

  const stream = await renderToReadableStream(
    <React.StrictMode>
      <App data={data} />
      <StreamInliner stream={encode(data)} />
      <script src="/bundle.js" />
    </React.StrictMode>
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/html",
      "Transfer-Encoding": "chunked",
    },
  });
});

serve({ ...app, port: 3000 }, () => {
  console.log("Server is running at http://localhost:3000");
});
