
import { Block } from "@/types/form";

export interface FormCache {
  data: {
    id: string;
    slug: string;
    title: string;
    form_type: string;
    description: string | null;
    version: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  blocks: Block[];
  timestamp: number;
  hits: number;
  version: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  lastAccessed: number;
  loadTime: number;
}
