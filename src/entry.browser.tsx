import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { decode } from "turbo-stream";

import App from "./app.js";

declare global {
  interface Window {
    __DATA__: ReadableStream<Uint8Array>;
  }
}

const textDecoder = new TextDecoder();
decode(
  window.__DATA__.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        console.log(textDecoder.decode(chunk, { stream: true }));
        controller.enqueue(chunk);
      },
    })
  )
)
  .then((decoded) => {
    hydrateRoot(document, <App data={decoded.value} />);
    return decoded.done;
  })
  .catch(console.error);
