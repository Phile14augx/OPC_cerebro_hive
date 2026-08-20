import { fileURLToPath } from "node:url";
import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";

export default defineTypeScriptWorkspace({
  eda: true,
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
});
