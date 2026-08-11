import { ValueObject } from './ValueObject';
import type { ResourceId } from '../ids/ids';

interface ResourceReferenceProps {
  readonly resourceId: ResourceId;
  /**
   * Kept as a plain string, not a Service Catalog enum — hiveforge/02-SERVICE-CATALOG.md's
   * concrete service list (Virtual Machines, Object Storage, PostgreSQL, ...)
   * belongs to whichever future slice actually builds the Service Catalog;
   * this package doesn't depend on it. A caller can pass whatever service
   * identifier string it has today (e.g. "hive-compute.virtual-machine").
   */
  readonly resourceType: string;
}

/**
 * A reference to a Resource from outside its own aggregate — e.g. what a
 * future UsageRecord or Operation would carry (hiveforge/01-DOMAIN-MODEL.md
 * §2: "always traceable to the Operation and Resource that produced it").
 * A reference, not the Resource aggregate itself — this package does not
 * define Resource as an aggregate in this slice.
 */
export class ResourceReference extends ValueObject<ResourceReferenceProps> {
  private constructor(props: ResourceReferenceProps) {
    super(props);
  }

  static of(resourceId: ResourceId, resourceType: string): ResourceReference {
    return new ResourceReference({ resourceId, resourceType });
  }

  get resourceId(): ResourceId {
    return this.props.resourceId;
  }

  get resourceType(): string {
    return this.props.resourceType;
  }
}
