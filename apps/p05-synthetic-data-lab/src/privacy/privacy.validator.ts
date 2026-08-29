export class PrivacyValidator {
  evaluate(dataset: any[], config: { k: number, quasiIdentifiers?: string[] }) {
    const groups = new Map<string, number>();
    const qis = config.quasiIdentifiers || Object.keys(dataset[0] || {});

    for (const record of dataset) {
      const keyObj: any = {};
      for (const qi of qis) {
        keyObj[qi] = record[qi];
      }
      const key = JSON.stringify(keyObj);
      groups.set(key, (groups.get(key) || 0) + 1);
    }

    let compliant = true;
    for (const count of groups.values()) {
      if (count < config.k) {
        compliant = false;
        break;
      }
    }

    return { compliant };
  }
}
