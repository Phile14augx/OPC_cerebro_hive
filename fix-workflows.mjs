import fs from "node:fs";
import path from "node:path";

const srcDir = "OPC/cerebro-hive-website/.github/workflows";
const destDir = ".github/workflows";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (file.endsWith(".yml") || file.endsWith(".yaml")) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    
    let content = fs.readFileSync(srcPath, "utf8");
    
    // Inject defaults.run.working-directory if not present
    if (!content.includes("working-directory:")) {
      const injectString = `\ndefaults:\n  run:\n    working-directory: OPC/cerebro-hive-website\n`;
      // Inject before jobs: or at the end of on: block
      content = content.replace(/^(jobs:)/m, `${injectString}\n$1`);
    }
    
    fs.writeFileSync(destPath, content, "utf8");
    fs.rmSync(srcPath);
  }
}
console.log("Moved and updated workflows.");
