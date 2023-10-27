import * as React from "react";

const js = String.raw;

export default function StreamInliner({
  stream,
}: {
  stream: ReadableStream<Uint8Array>;
}) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: js`
            window.__DATA__ = new ReadableStream({
              start(controller) {
                let encoder = new TextEncoder();
                window.__DATA_CHUNK__ = function(chunk) {
                  if (typeof chunk === "undefined")
                    controller.close();
                  else
                    controller.enqueue(encoder.encode(chunk));
                };
              }
            });
          `,
        }}
      />
      <InlineStream decoder={decoder} reader={reader} />
    </>
  );
}

async function InlineStream({
  decoder,
  reader,
}: {
  decoder: TextDecoder;
  reader: ReadableStreamDefaultReader<Uint8Array>;
}) {
  const read = await reader.read();
  const decoded = decoder.decode(read.value, { stream: true });

  const script = decoded ? (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__DATA_CHUNK__(${JSON.stringify(decoded)});`,
      }}
    />
  ) : null;

  if (read.done) {
    return (
      <>
        {script}
        <script
          dangerouslySetInnerHTML={{ __html: js`window.__DATA_CHUNK__();` }}
        />
      </>
    );
  }

  return (
    <>
      {script}
      <React.Suspense>
        <InlineStream decoder={decoder} reader={reader} />
      </React.Suspense>
    </>
  );
}

// Taken from https://github.com/cyco130/vite-rsc/blob/2e3d0ad9915e57c4b2eaa3ea24b46c1b477a4cce/packages/fully-react/src/server/htmlescape.ts#L25C1-L38C2
const TERMINATORS_LOOKUP: Record<string, string> = {
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const TERMINATORS_REGEX = /[\u2028\u2029]/g;

function sanitizer(match: string | number) {
  return TERMINATORS_LOOKUP[match];
}

export function sanitize(str: string) {
  return str.replace(TERMINATORS_REGEX, sanitizer);
}
