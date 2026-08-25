import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineTypeScriptWorkspace({
  tsconfigRootDir: __dirname,
});
