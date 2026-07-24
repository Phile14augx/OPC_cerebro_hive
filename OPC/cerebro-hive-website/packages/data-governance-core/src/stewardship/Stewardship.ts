export interface DataStewardship {
  datasetId: string;
  
  businessOwnerId: string; // Accountable business function
  technicalOwnerId: string; // Engineering lead
  dataStewardId: string; // Operational custodian
  custodianId: string; // Infrastructure owner
}

export class StewardshipManager {
  private registries = new Map<string, DataStewardship>();

  assignStewardship(stewardship: DataStewardship) {
    this.registries.set(stewardship.datasetId, stewardship);
  }

  getStewardship(datasetId: string): DataStewardship | undefined {
    return this.registries.get(datasetId);
  }
}
