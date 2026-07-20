export type IconCategory = 
  | "navigation" 
  | "architecture" 
  | "chat" 
  | "actions" 
  | "files" 
  | "status" 
  | "feedback";

export interface IconMetadata {
  name: string;
  category: IconCategory;
  keywords: string[];
}
