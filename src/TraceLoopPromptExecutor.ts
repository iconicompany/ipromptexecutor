import * as traceloop from "@traceloop/node-server-sdk";
import { PromptExecutor } from "./PromptExecutor";
import type { ChatCompletionCreateParams } from "openai/resources/chat/completions";
import OpenAI from "openai";
import { TextParser, type Parser } from "./Parser";


export class TraceLoopPromptExecutor extends PromptExecutor {
    protected openai: OpenAI;
    protected parser: Parser<any>;

    constructor(parser: Parser<any> = new TextParser()) {
        super();
        this.openai = new OpenAI();
        this.parser = parser;
    }


    public async execute<T>(
        promptName: string,
        variables: Record<string, string>,
        model?: string,
        properties: Record<string, string> = {},
    ): Promise<T | null> {
        const executeOpenAI = async () => {
            const prompt: ChatCompletionCreateParams = traceloop.getPrompt(promptName, variables);

            // Override model from parameter, then environment variable if provided
            if (model) {
                prompt.model = model;
            }

            const chatCompletion = await this.openai.chat.completions.create(prompt);
            const content = chatCompletion.choices[0].message.content;
            return this.parser.parse(content) as T | null;
        };

        return Object.keys(properties).length > 0
            ? await traceloop.withAssociationProperties(properties, executeOpenAI)
            : await executeOpenAI();
    }
}
