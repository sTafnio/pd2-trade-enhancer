import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// The built script is committed: managers check it for a higher @version and update from it
const RELEASE_URL = "https://raw.githubusercontent.com/sTafnio/pd2-trade-enhancer/main/dist/pd2-trade-enhancer.user.js";

export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "pd2-trade-enhancer",
        icon: "https://projectdiablo2.com/image/portal.png",
        // Name + namespace identify the script in the userscript manager: changing either installs a second copy
        namespace: "https://github.com/sTafnio/pd2-trade-enhancer",
        match: [
          "https://www.projectdiablo2.com/*",
          "https://projectdiablo2.com/*",
        ],
        description: "Userscript to enhance the Project Diablo 2 trade website",
        author: "sTafnio",
        downloadURL: RELEASE_URL,
        // Livesearch reads the site's Vue app and API client, which only the page world can see.
        // Violentmonkey: page world (overrides the user's default). If a CSP ever blocks page scripts, "auto"
        // still runs it as a content script (/create works, livesearch reports it can't start); "page" wouldn't run.
        "inject-into": "auto",
        // Tampermonkey: pin its current default (page world) explicitly
        sandbox: "raw",
        noframes: true,
      },
    }),
  ],
});
