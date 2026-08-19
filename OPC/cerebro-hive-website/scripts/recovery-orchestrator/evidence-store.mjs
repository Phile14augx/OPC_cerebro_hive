import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

export class EvidenceStore {
  constructor(rootDir) {
    this.rootDir = rootDir;
  }

  async write(kind, id, payload) {
    await fs.mkdir(this.rootDir, { recursive: true });
    const safeKind = kind.replace(/[^a-z0-9_-]/gi, "-");
    const safeId = id.replace(/[^a-z0-9_-]/gi, "-");
    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeKind}-${safeId}.json`;
    const fullPath = path.join(this.rootDir, filename);
    const content = stableStringify(payload);
    await fs.writeFile(fullPath, content, { encoding: "utf8", flag: "wx" });
    const sha256 = crypto.createHash("sha256").update(content).digest("hex");
    return { path: fullPath, sha256, bytes: Buffer.byteLength(content) };
  }

  async appendManifest(record) {
    await fs.mkdir(this.rootDir, { recursive: true });
    const manifest = path.join(this.rootDir, "SHA256SUMS.jsonl");
    await fs.appendFile(manifest, `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`, "utf8");
  }
}
