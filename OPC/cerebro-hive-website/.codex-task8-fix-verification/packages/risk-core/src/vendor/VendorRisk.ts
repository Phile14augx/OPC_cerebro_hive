export type CriticalityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface VendorProfile {
  vendorId: string;
  name: string;
  externalOrgRef: string; // Ref to Identity OS B2B Org
  
  criticality: CriticalityLevel;
  sharedDatasets: string[]; // Refs to Data Governance Catalog
  
  certifications: string[]; // e.g., 'SOC 2 Type II', 'ISO 27001'
  openFindings: number;
  
  residualVendorRisk: string; // e.g., 'Medium'
}

export class VendorRiskRegistry {
  private vendors = new Map<string, VendorProfile>();

  registerVendor(vendor: VendorProfile) {
    this.vendors.set(vendor.vendorId, vendor);
  }

  getVendor(vendorId: string): VendorProfile | undefined {
    return this.vendors.get(vendorId);
  }
}
