import * as React from "react";

export default function App({ data }: { data: any }) {
  React.useEffect(() => {
    console.log("Data from server:", data);
  }, [data]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>turbo-stream + react-router</title>
      </head>
      <body>
        <main>
          <h1>
            Check the terminal for the data that was transported from the server
            to the browser.
          </h1>
        </main>
      </body>
    </html>
  );
}
