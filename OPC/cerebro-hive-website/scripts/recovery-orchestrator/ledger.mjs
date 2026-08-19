import fs from "node:fs/promises";
import path from "node:path";

export class RecoveryLedger {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async append(type, payload) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const record = { at: new Date().toISOString(), type, payload };
    await fs.appendFile(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
    return record;
  }

  async readAll() {
    try {
      const text = await fs.readFile(this.filePath, "utf8");
      return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async latestState(initialState) {
    const records = await this.readAll();
    const stateRecords = records.filter((record) => record.type === "STATE");
    return stateRecords.length ? stateRecords.at(-1).payload : initialState;
  }
}
