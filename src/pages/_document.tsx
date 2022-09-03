import Document, { Head, Html, Main, NextScript } from "next/document";

/**
 * Different from _app.tsx, the code here is executed once, so features like
 * fonts must be in here.
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap"
            rel="stylesheet"
          />

          {/**
           * todos nosso assets estão armazenados e referenciados a
           * partir da pasta public
           */}
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        </Head>
        <body>
          <Main />
          {/**
           * attaches and loads our javascript files
           */}
          <NextScript />
        </body>
      </Html>
    );
  }
}
