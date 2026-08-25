import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";
import { fileURLToPath } from "url";
export default defineTypeScriptWorkspace({ tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)) });
