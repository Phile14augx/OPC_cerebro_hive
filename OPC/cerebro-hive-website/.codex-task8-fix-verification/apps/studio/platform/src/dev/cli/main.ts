#!/usr/bin/env node
/** cerebro CLI — operate the platform from a terminal. */
import { CerebroClient } from "../sdk/client.js";

const [, , command, ...args] = process.argv;
const baseUrl = process.env.CEREBRO_URL ?? "http://127.0.0.1:8090";
const apiKey = process.env.CEREBRO_API_KEY ?? "";

async function main(): Promise<void> {
  const client = new CerebroClient({ baseUrl, apiKey });
  switch (command) {
    case "run": {
      const goal = args.join(" ");
      const res = await client.runtime.run(goal, { sync: true });
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    case "ask": {
      const res = await client.knowledge.answer(args.join(" "));
      console.log(res.answer);
      break;
    }
    case "cockpit": {
      console.log(JSON.stringify(await client.sphere.cockpit(), null, 2));
      break;
    }
    case "agents": {
      console.log(JSON.stringify(await client.mesh.agents(), null, 2));
      break;
    }
    case "bootstrap": {
      const [name, slug, email] = args;
      const res = await fetch(`${baseUrl}/v1/bootstrap`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug, ownerEmail: email, bootstrapKey: process.env.PLATFORM_BOOTSTRAP_KEY }),
      }).then(r => r.json());
      console.log(JSON.stringify(res, null, 2));
      break;
    }
    default:
      console.log(`cerebro CLI
usage:
  cerebro bootstrap <name> <slug> <email>   create an organization + api key
  cerebro run <goal...>                      run an execution synchronously
  cerebro ask <question...>                  grounded answer from knowledge
  cerebro cockpit                            executive cockpit JSON
  cerebro agents                             mesh directory
env: CEREBRO_URL, CEREBRO_API_KEY`);
  }
}
main().catch(err => { console.error(String(err)); process.exit(1); });
