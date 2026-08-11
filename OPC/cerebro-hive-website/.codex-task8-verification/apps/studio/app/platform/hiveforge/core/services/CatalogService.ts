import { platformRegistry } from "../registry/PlatformRegistry";
import { Plugin } from "../contracts/plugin";

export interface ICatalogService {
  getCatalog(): Plugin[];
  getCloud(id: string): Plugin | undefined;
  getBlueprint(id: string): Plugin | undefined;
  getProvider(id: string): Plugin | undefined;
}

export class CatalogService implements ICatalogService {
  getCatalog(): Plugin[] {
    return platformRegistry.getAll();
  }

  getCloud(id: string): Plugin | undefined {
    const plugin = platformRegistry.get(id);
    return plugin?.manifest.kind === "cloud" ? plugin : undefined;
  }

  getBlueprint(id: string): Plugin | undefined {
    const plugin = platformRegistry.get(id);
    return plugin?.manifest.kind === "blueprint" ? plugin : undefined;
  }

  getProvider(id: string): Plugin | undefined {
    const plugin = platformRegistry.get(id);
    return plugin?.manifest.kind === "provider" ? plugin : undefined;
  }
}

export const catalogService = new CatalogService();
