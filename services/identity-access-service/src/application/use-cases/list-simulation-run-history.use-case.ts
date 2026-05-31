import type { SimulationRunRecord } from '../../domain/simulation/simulation-run-record.js';
import type { SimulationRunHistoryStore } from '../services/simulation-run-history-store.js';

export class ListSimulationRunHistoryUseCase {
  public constructor(private readonly simulationRunHistoryStore: SimulationRunHistoryStore) {}

  public async execute(): Promise<SimulationRunRecord[]> {
    return this.simulationRunHistoryStore.list();
  }
}
