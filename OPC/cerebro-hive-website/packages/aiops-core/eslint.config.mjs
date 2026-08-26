import { fileURLToPath } from "node:url";
import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";
export default defineTypeScriptWorkspace({ tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)) });
