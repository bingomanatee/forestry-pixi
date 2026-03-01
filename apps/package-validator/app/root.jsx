import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import stylesheet from "./styles.css?url";

export function links() {
  return [{ rel: "stylesheet", href: stylesheet }];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/static/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppRoot() {
  return <Outlet />;
}
