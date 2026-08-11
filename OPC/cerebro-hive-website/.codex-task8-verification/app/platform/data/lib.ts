// Re-exported from the single shared platform API client.
// See lib/platform-api.ts — this file previously carried its own duplicate copy
// of API/KEY/api()/checkOnline(), which had drifted from the other product pages.
export { API, KEY, api, checkOnline, PlatformApiError } from "@/lib/platform-api";

export type ArchiveDoc = {
  id: string;
  title: string;
  description?: string;
  domain: string;
  resource_type?: string;
  tags?: string[];
  is_public: boolean;
  version: number;
  file_path?: string;
  file_type?: string;
  file_size_bytes?: number;
  created_at: string;
  updated_at?: string;
};

export type DocList = {
  items: ArchiveDoc[];
  total: number;
  page: number;
  page_size: number;
};
