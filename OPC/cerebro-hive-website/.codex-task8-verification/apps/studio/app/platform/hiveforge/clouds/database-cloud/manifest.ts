import { ExtensionManifest, Plugin, PluginContext } from "../../core/contracts/plugin";
import { ServiceManifest } from "../../core/contracts/service";
import { platformRegistry } from "../../core/registry/PlatformRegistry";

export const databaseCloudManifest: ExtensionManifest = {
  schemaVersion: "1.0",
  apiVersion: "v1",
  kind: "cloud",
  metadata: {
    id: "hiveforge.cloud.database",
    name: "Database Cloud",
    version: "2.0.0",
    description: "Enterprise Data Services including Relational, NoSQL, and Graph databases.",
    icon: "🗄️"
  },
  spec: {}
};

export const postgresService: ServiceManifest = {
  id: "hiveforge.service.postgres",
  name: "Managed PostgreSQL",
  description: "High-performance distributed PostgreSQL cluster.",
  version: "1.0.0",
  supportedProviders: ["aws.rds", "azure.flexibleserver", "local.docker"],
  supportedBlueprints: ["bp.pg.ha", "bp.pg.dev"],
  capabilities: ["databases.relational", "databases.backups.pitr", "databases.monitoring"],
  dependencies: [],
  pricingMetadata: {
    model: "pay-as-you-go",
    basePrice: 15,
    currency: "USD"
  },
};

export class DatabaseCloudPlugin implements Plugin {
  readonly manifest = databaseCloudManifest;
  state: any = "installed";
  health: any = "Starting";
  
  navigationNodes = [
    {
      id: "nav.cloud.database",
      location: "clouds" as const,
      title: "Database Cloud",
      icon: "🗄️",
      priority: 30
    }
  ];

  actions = [
    {
      id: "action.db.deploy_postgres",
      title: "Deploy PostgreSQL Cluster",
      category: "Deploy" as const,
      execute: async () => { console.log("Deploying PG..."); }
    }
  ];

  async register(context: PluginContext) {
    // Register the Postgres Service into a (mock) service registry if we had one.
    // We can also just rely on the plugin being registered.
  }
}
