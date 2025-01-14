import { PilotPromptCreator } from '@/utils/PilotPromptCreator';
import {SnapshotManager} from '@/utils/SnapshotManager';
import {PreviousStep, PromptHandler} from '@/types';


export class PilotStepCreator {
    constructor(
        private promptCreator: PilotPromptCreator,
        private snapshotManager: SnapshotManager,
        private promptHandler: PromptHandler,
    ) {
    }

   
    private async captureSnapshotAndViewHierarchy() {
        const snapshot = this.promptHandler.isSnapshotImageSupported()
            ? await this.snapshotManager.captureSnapshotImage()
            : undefined;
        const viewHierarchy = await this.snapshotManager.captureViewHierarchyString();

        const isSnapshotImageAttached = snapshot != null && this.promptHandler.isSnapshotImageSupported();

        return { snapshot, viewHierarchy, isSnapshotImageAttached };
    }

    private async generateNextStep(
        goal: string,
        previous: PreviousStep[],
        snapshot: any,
        viewHierarchy: string,
        isSnapshotImageAttached: boolean,
    ): Promise<string> {
        const prompt = this.promptCreator.createPrompt(goal, viewHierarchy, isSnapshotImageAttached, previous);
        const promptResult = await this.promptHandler.runPrompt(prompt, snapshot);
        return promptResult;
    }

    async createStep(goal: string, previous: PreviousStep[] = [], attempts: number = 2): Promise<string> {
       
        let lastError: any = null;

            try {
                const { snapshot, viewHierarchy, isSnapshotImageAttached } = await this.captureSnapshotAndViewHierarchy();
                const copilotStep = await this.generateNextStep(goal, previous, snapshot, viewHierarchy, isSnapshotImageAttached);
                
                if (!copilotStep) {
                    throw new Error(`Failed to generate pilot's next step`);
                }
                return copilotStep;
            } catch (error) {
                lastError = error;
                console.log('\x1b[33m%s\x1b[0m', `pilot encountered an error: ${error instanceof Error ? error.message : error}`);
            }

        throw lastError;
    }
}
