import {Links, Meta, Outlet, Scripts,} from "@remix-run/react";

import {LinksFunction} from "@remix-run/node";

import {RemixApiProvider} from "@react-params/remix";

export const links: LinksFunction = () => [
]

export default function App() {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        </head>
        <body className={"min-h-screen bg-background font-sans antialiased  text-gray-800 relative"}
    style={{fontFamily: "system-ui, sans-serif", lineHeight: "1.8"}}>

    <RemixApiProvider>
        <Outlet/>
    </RemixApiProvider>
    <Scripts/>
    </body>
    </html>
);
}
