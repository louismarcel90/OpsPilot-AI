import type { SimulationRunRecord } from '../../domain/simulation/simulation-run-record.js';
import type { SimulationRunHistoryStore } from '../services/simulation-run-history-store.js';

export class GetSimulationRunDetailUseCase {
  public constructor(private readonly simulationRunHistoryStore: SimulationRunHistoryStore) {}

  public async execute(runId: string): Promise<SimulationRunRecord | null> {
    return this.simulationRunHistoryStore.findById(runId);
  }
}
