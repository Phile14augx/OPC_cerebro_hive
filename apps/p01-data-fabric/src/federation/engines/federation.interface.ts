export interface IFederationEngine {
  query(sql: string): Promise<any[]>;
}