/* eslint-disable @typescript-eslint/no-require-imports */
const { ESLint } = require("eslint");
const fs = require("fs");

(async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["**/*.ts", "**/*.tsx"]);
  
  // Format the results to just print the errors
  let output = "";
  for (const result of results) {
    if (result.errorCount > 0 || result.warningCount > 0) {
      output += result.filePath + "\n";
      for (const msg of result.messages) {
        if (msg.severity > 0) {
            output += `  Line ${msg.line}: ${msg.message} (${msg.ruleId})\n`;
        }
      }
    }
  }
  
  if (output === "") {
    output = "No lint errors found!";
  }
  
  fs.writeFileSync("eslint-results.txt", output);
  console.log("ESLint finished. Results written to eslint-results.txt");
})().catch((error) => {
  console.error("Error running ESLint:", error);
  process.exit(1);
});
