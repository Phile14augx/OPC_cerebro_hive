import { fileURLToPath } from "node:url";
import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";

const config = defineTypeScriptWorkspace({
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
});

config[0].languageOptions.parserOptions.project = "./tsconfig.eslint.json";

export default config;
