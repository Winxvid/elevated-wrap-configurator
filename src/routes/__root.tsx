import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Elevated Auto Wraps";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Elevated Auto Wraps — See the wrap before you commit" },
      {
        name: "description",
        content:
          "See a vinyl wrap on your car before you book it. Studio preview for gloss, satin, chrome, and color-shift film.",
      },
      { name: "theme-color", content: "#f4f4f2" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Outfit:wght@400;500;600;700&display=swap",
      },
      { rel: "canonical", href: "/" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("elevated.theme")||localStorage.getItem("sheen.theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t;}catch(e){}var SELF={"/":1};var p=location.pathname.replace(/\\/+$/,"")||"/";var el=document.querySelector('link[rel="canonical"]');if(!el)return;var origin="https://"+location.host;el.setAttribute("href",SELF[p]?origin+p:origin+"/");})();`,
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

export { APP_NAME };
