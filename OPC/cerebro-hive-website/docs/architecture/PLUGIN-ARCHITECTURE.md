# Plugin Architecture

New technologies should add a **manifest + template + adapter + tests**, not twenty UI switches.

```ts
interface CerebroCapabilityPlugin {
  manifest: PluginManifest
  generators?: GeneratorAdapter[]
  runtimes?: RuntimeAdapter[]
  databases?: DatabaseProvider[]
  deployers?: DeploymentAdapter[]
  testers?: TestAdapter[]
}
```

Source: `packages/plugin-sdk/src/adapters.ts` and `technology.ts`.

Existing `CerebroPlugin` lifecycle (`onLoad` / `onUnload`) remains for runtime extensions.

Day 2+ generators and Day 4 database providers must register here instead of duplicating Studio conditionals.
