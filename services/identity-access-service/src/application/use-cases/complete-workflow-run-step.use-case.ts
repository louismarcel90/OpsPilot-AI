import type { ApprovalRequestWriteRepository } from '../repositories/approval-request-write-repository.js';
import type { WorkflowRunStep } from '../../domain/workflows/workflow-run-step.js';
import { canCompleteWorkflowRunStep } from '../../domain/workflows/workflow-run-step-transition.js';
import { findNextWorkflowRunStep } from '../../infrastructure/workflows/find-next-workflow-run-step.js';
import type { WorkflowRunReadRepository } from '../repositories/workflow-run-read-repository.js';
import type { WorkflowRunStepReadRepository } from '../repositories/workflow-run-step-read-repository.js';
import type { WorkflowRunStepWriteRepository } from '../repositories/workflow-run-step-write-repository.js';
import type { WorkflowRunWriteRepository } from '../repositories/workflow-run-write-repository.js';
import type { WorkflowStepReadRepository } from '../repositories/workflow-step-read-repository.js';
import type { WorkflowVersionReadRepository } from '../repositories/workflow-version-read-repository.js';
import type { WorkflowRuntimeEventRecorder } from '../services/workflow-runtime-event-recorder.js';

export class CompleteWorkflowRunStepUseCase {
  public constructor(
    private readonly workflowRunReadRepository: WorkflowRunReadRepository,
    private readonly workflowRunWriteRepository: WorkflowRunWriteRepository,
    private readonly workflowRunStepReadRepository: WorkflowRunStepReadRepository,
    private readonly workflowRunStepWriteRepository: WorkflowRunStepWriteRepository,
    private readonly workflowVersionReadRepository: WorkflowVersionReadRepository,
    private readonly workflowStepReadRepository: WorkflowStepReadRepository,
    private readonly approvalRequestWriteRepository: ApprovalRequestWriteRepository,
    private readonly workflowRuntimeEventRecorder: WorkflowRuntimeEventRecorder,
  ) {}

  public async execute(runStepId: string): Promise<WorkflowRunStep> {
    const workflowRunStep = await this.workflowRunStepReadRepository.findById(runStepId);

    if (workflowRunStep === null) {
      throw new Error('Workflow run step was not found.');
    }

    if (!canCompleteWorkflowRunStep(workflowRunStep.status)) {
      throw new Error(
        `Workflow run step cannot transition from "${workflowRunStep.status}" to "completed".`,
      );
    }

    const updatedRunStep = await this.workflowRunStepWriteRepository.completeRunStep(runStepId);

    if (updatedRunStep === null) {
      throw new Error('Workflow run step could not be completed.');
    }

    const workflowRun = await this.workflowRunReadRepository.findById(updatedRunStep.workflowRunId);

    if (workflowRun === null) {
      throw new Error('Workflow run was not found during step completion.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: updatedRunStep.workflowRunId,
      workspaceId: workflowRun.workspaceId,
      eventType: 'workflow_run_step_completed',
      payload: {
        workflowRunId: updatedRunStep.workflowRunId,
        workflowRunStepId: updatedRunStep.id,
        workflowStepDefinitionId: updatedRunStep.workflowStepDefinitionId,
        sequenceNumber: updatedRunStep.sequenceNumber,
        previousStatus: workflowRunStep.status,
        status: updatedRunStep.status,
        completedAtIso: updatedRunStep.completedAtIso ?? null,
      },
    });

    const allRunSteps = await this.workflowRunStepReadRepository.listByWorkflowRunId(
      updatedRunStep.workflowRunId,
    );

    const nextRunStep = findNextWorkflowRunStep(updatedRunStep, allRunSteps);

    if (nextRunStep !== null) {
      if (nextRunStep.status === 'pending') {
        const workflowVersion = await this.workflowVersionReadRepository.findById(
          workflowRun.workflowVersionId,
        );

        if (workflowVersion === null) {
          throw new Error('Workflow version was not found during next-step progression.');
        }

        const stepDefinitions = await this.workflowStepReadRepository.listByWorkflowVersionId(
          workflowVersion.id,
        );

        const nextStepDefinition = stepDefinitions.find(
          (stepDefinition) => stepDefinition.id === nextRunStep.workflowStepDefinitionId,
        );

        if (nextStepDefinition === undefined) {
          throw new Error('Next workflow step definition was not found.');
        }

        if (nextStepDefinition.stepType === 'approval_gate') {
          const blockedRunStep = await this.workflowRunStepWriteRepository.markRunStepBlocked(
            nextRunStep.id,
          );

          if (blockedRunStep === null) {
            throw new Error('Approval-gate workflow run step could not be blocked.');
          }

          await this.workflowRuntimeEventRecorder.record({
            workflowRunId: blockedRunStep.workflowRunId,
            workspaceId: workflowRun.workspaceId,
            eventType: 'workflow_run_step_blocked',
            payload: {
              workflowRunId: blockedRunStep.workflowRunId,
              workflowRunStepId: blockedRunStep.id,
              workflowStepDefinitionId: blockedRunStep.workflowStepDefinitionId,
              sequenceNumber: blockedRunStep.sequenceNumber,
              status: blockedRunStep.status,
              stepType: nextStepDefinition.stepType,
            },
          });

          const approvalRequest = await this.approvalRequestWriteRepository.create({
            workflowRunId: workflowRun.id,
            workflowRunStepId: blockedRunStep.id,
            workspaceId: workflowRun.workspaceId,
          });

          await this.workflowRuntimeEventRecorder.record({
            workflowRunId: approvalRequest.workflowRunId,
            workspaceId: approvalRequest.workspaceId,
            eventType: 'approval_request_created',
            payload: {
              approvalRequestId: approvalRequest.id,
              workflowRunId: approvalRequest.workflowRunId,
              workflowRunStepId: approvalRequest.workflowRunStepId,
              status: approvalRequest.status,
              requestedAtIso: approvalRequest.requestedAtIso,
            },
          });
        } else {
          const markedReady = await this.workflowRunStepWriteRepository.markRunStepReady(
            nextRunStep.id,
          );

          if (markedReady === null) {
            throw new Error('Next workflow run step could not be marked ready.');
          }

          await this.workflowRuntimeEventRecorder.record({
            workflowRunId: markedReady.workflowRunId,
            workspaceId: workflowRun.workspaceId,
            eventType: 'workflow_run_step_ready',
            payload: {
              workflowRunId: markedReady.workflowRunId,
              workflowRunStepId: markedReady.id,
              workflowStepDefinitionId: markedReady.workflowStepDefinitionId,
              sequenceNumber: markedReady.sequenceNumber,
              status: markedReady.status,
              stepType: nextStepDefinition.stepType,
            },
          });
        }
      }

      return updatedRunStep;
    }

    const completedRun = await this.workflowRunWriteRepository.completeRun(
      updatedRunStep.workflowRunId,
    );

    if (completedRun === null) {
      throw new Error('Workflow run could not be completed after final step completion.');
    }

    await this.workflowRuntimeEventRecorder.record({
      workflowRunId: completedRun.id,
      workspaceId: completedRun.workspaceId,
      eventType: 'workflow_run_completed',
      payload: {
        workflowRunId: completedRun.id,
        previousStatus: workflowRun.status,
        status: completedRun.status,
        completedAtIso: completedRun.completedAtIso ?? null,
      },
    });

    return updatedRunStep;
  }
}
