export interface ToolRegistry {
  hasTool(toolBinding: string): boolean;
  listToolKeys(): string[];
}
