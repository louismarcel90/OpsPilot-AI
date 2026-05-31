import type { SimulationRunRecord } from '../../domain/simulation/simulation-run-record.js';

export interface SimulationRunHistoryStore {
  append(record: SimulationRunRecord): void;
  list(): SimulationRunRecord[];
  findById(id: string): SimulationRunRecord | null;
}
