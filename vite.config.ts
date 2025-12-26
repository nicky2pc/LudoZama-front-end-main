import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { embedConfig } from "./src/embedConfig";
import { generateReferralPage } from "./src/lib/generateReferralPage";

function fcFrameMeta(): Plugin {
  return {
    name: "inject-fc-frame-meta",
    transformIndexHtml(html: string) {
      const embedJson = JSON.stringify(embedConfig);
      const metaTag = `<meta name="fc:frame" content='${embedJson}'>`;
      return html.replace("</head>", `${metaTag}\n</head>`);
    },
  };
}

// Plugin to handle referral routes during development
function referralRoutes(): Plugin {
  return {
    name: "referral-routes",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const refPathRegex = /^\/api\/ref\/([^/]+)$/;
        const match = req.url?.match(refPathRegex);

        if (match) {
          const referralCode = match[1];
          const html = generateReferralPage(referralCode);

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), fcFrameMeta(), referralRoutes()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: true,
    },
    define: {
      // Make VERCEL_URL available to client-side code
      "process.env.VITE_PAGE_URL": JSON.stringify(env.VITE_PAGE_URL || ""),
    },
  };
});
