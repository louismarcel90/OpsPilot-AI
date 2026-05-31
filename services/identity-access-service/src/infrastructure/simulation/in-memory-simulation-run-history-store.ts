import type { SimulationRunHistoryStore } from '../../application/services/simulation-run-history-store.js';
import type { SimulationRunRecord } from '../../domain/simulation/simulation-run-record.js';

export class InMemorySimulationRunHistoryStore implements SimulationRunHistoryStore {
  private readonly records: SimulationRunRecord[] = [];

  public append(record: SimulationRunRecord): void {
    this.records.unshift(record);
  }

  public list(): SimulationRunRecord[] {
    return [...this.records];
  }

  public findById(id: string): SimulationRunRecord | null {
    return this.records.find((record) => record.id === id) ?? null;
  }
}
