import { type Parser } from "./Parser";
export abstract class PromptExecutor {
  /**
   * Executes a prompt and returns the result from the language model.
   * @param promptName The name/key of the prompt to execute.
   * @param variables The variables to substitute into the prompt template.
   * @param model Optional model to use for the execution, overriding any default.
   * @param properties Optional association properties for tracing.
   * @param parser Optional parser to use for the execution, overriding any default.
   * @returns The content of the language model's response.
   */
  abstract execute<T>(
    promptName: string,
    variables: Record<string, string>,
    model?: string,
    parser?: Parser<T>,
    properties?: Record<string, string>
  ): Promise<T | null>;
}
