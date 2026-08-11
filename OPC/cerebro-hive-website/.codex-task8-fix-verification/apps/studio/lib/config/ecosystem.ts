export interface IntegrationNode {
  id: string;
  name: string;
  category: "ERP" | "CRM" | "Cloud" | "Data" | "Productivity" | "Development";
}

export const ecosystemIntegrations: IntegrationNode[] = [
  // ERP
  { id: "sap", name: "SAP", category: "ERP" },
  { id: "oracle", name: "Oracle", category: "ERP" },
  
  // CRM
  { id: "salesforce", name: "Salesforce", category: "CRM" },
  { id: "hubspot", name: "HubSpot", category: "CRM" },
  
  // Cloud
  { id: "aws", name: "AWS", category: "Cloud" },
  { id: "azure", name: "Azure", category: "Cloud" },
  
  // Data
  { id: "snowflake", name: "Snowflake", category: "Data" },
  { id: "databricks", name: "Databricks", category: "Data" },
  
  // Productivity
  { id: "m365", name: "Microsoft 365", category: "Productivity" },
  
  // Development
  { id: "github", name: "GitHub", category: "Development" },
  { id: "jira", name: "Jira", category: "Development" }
];
