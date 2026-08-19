import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function stableStringify(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
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
    return { path: fullPath, sha256: sha256(content), bytes: Buffer.byteLength(content) };
  }

  async readVerified(artifact) {
    if (!artifact?.path || !artifact?.sha256) throw new Error("EVIDENCE_ARTIFACT_REFERENCE_REQUIRED");
    const root = path.resolve(this.rootDir);
    const fullPath = path.resolve(artifact.path);
    const relative = path.relative(root, fullPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`EVIDENCE_PATH_OUTSIDE_STORE: ${fullPath}`);
    }
    const content = await fs.readFile(fullPath, "utf8");
    const actualSha256 = sha256(content);
    if (actualSha256 !== artifact.sha256) {
      throw new Error(`EVIDENCE_SHA256_MISMATCH: expected ${artifact.sha256}, got ${actualSha256}`);
    }
    return JSON.parse(content);
  }

  async appendManifest(record) {
    await fs.mkdir(this.rootDir, { recursive: true });
    const manifest = path.join(this.rootDir, "SHA256SUMS.jsonl");
    await fs.appendFile(manifest, `${JSON.stringify({ at: new Date().toISOString(), ...record })}\n`, "utf8");
  }
}
