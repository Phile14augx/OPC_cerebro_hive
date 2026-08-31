import * as fs from 'fs';
import { generateProposal } from '../proposal/generator.js';
import { canonicalJson, sha256Canonical } from '../canonical/json.js';

export async function runPropose(inputFilePath: string) {
    const content = fs.readFileSync(inputFilePath, 'utf8');
    const input = JSON.parse(content);

    const proposal = generateProposal(input);
    const canonical = canonicalJson(proposal);
    const sha256 = sha256Canonical(proposal);

    console.log(canonical);
    console.log(`SHA256: ${sha256}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const inputPath = process.argv[2];
    if (!inputPath) {
        console.error('Usage: propose <input.json>');
        process.exit(1);
    }
    runPropose(inputPath).catch(err => {
        console.error(err);
        process.exit(1);
    });
}
