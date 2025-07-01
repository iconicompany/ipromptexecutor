import * as traceloop from "@traceloop/node-server-sdk";
import { PromptExecutor } from "./PromptExecutor";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions";
import OpenAI from "openai";

export class TraceLoopPromptExecutor extends PromptExecutor {
    protected openai: OpenAI;

    constructor() {
        super();
        this.openai = new OpenAI();
    }


    public async execute(
        promptName: string,
        variables: Record<string, string>,
        model?: string,
        properties: Record<string, string> = {},
    ): Promise<string | null> {
        const executeOpenAI = async () => {
            const prompt: ChatCompletionCreateParams = traceloop.getPrompt(promptName, variables);

            // Override model from parameter, then environment variable if provided
            if (model) {
                prompt.model = model;
            }

            const chatCompletion = await this.openai.chat.completions.create(prompt);
            return chatCompletion.choices[0].message.content;
        };

        return Object.keys(properties).length > 0
            ? await traceloop.withAssociationProperties(properties, executeOpenAI)
            : await executeOpenAI();
    }
}
