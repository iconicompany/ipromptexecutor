export abstract class PromptExecutor {

    /**
     * Executes a prompt and returns the result from the language model.
     * @param promptName The name/key of the prompt to execute.
     * @param variables The variables to substitute into the prompt template.
     * @param model Optional model to use for the execution, overriding any default.
     * @param properties Optional association properties for tracing.
     * @returns The content of the language model's response.
     */
    abstract execute(
        promptName: string,
        variables: Record<string, string>,
        model?: string,
        properties?: Record<string, string>,
    ): Promise<string | null>;
}
