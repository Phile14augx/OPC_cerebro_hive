import { fileURLToPath } from "node:url";
import { defineTypeScriptWorkspace } from "../../eslint.workspace.config.mjs";

const config = defineTypeScriptWorkspace({
  tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
});

for (const c of config) {
  if (c.languageOptions?.parserOptions) {
    c.languageOptions.parserOptions.project = "./tsconfig.eslint.json";
  }
}

export default config;
