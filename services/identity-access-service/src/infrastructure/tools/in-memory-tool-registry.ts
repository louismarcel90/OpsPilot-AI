import type { ToolRegistry } from '../../application/services/tool-registry.js';

const TOOL_KEYS = [
  'ticket-routing-tool',
  'runbook-execution-tool',
  'incident-commentary-tool',
  'change-window-validation-tool',
] as const;

export class InMemoryToolRegistry implements ToolRegistry {
  private readonly toolKeys: ReadonlySet<string>;

  public constructor() {
    this.toolKeys = new Set<string>(TOOL_KEYS);
  }

  public hasTool(toolBinding: string): boolean {
    return this.toolKeys.has(toolBinding);
  }

  public listToolKeys(): string[] {
    return [...this.toolKeys];
  }
}
