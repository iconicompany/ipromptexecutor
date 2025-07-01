import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TraceLoopPromptExecutor } from "../src/TraceLoopPromptExecutor";
import * as traceloop from "@traceloop/node-server-sdk";
import OpenAI from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
} from "openai/resources/chat/completions";

vi.mock("@traceloop/node-server-sdk");
vi.mock("openai", () => {
  const OpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  }));
  return { default: OpenAI, OpenAI };
});

describe.skip("TraceLoopPromptExecutor", () => {
  let executor: TraceLoopPromptExecutor;
  let mockOpenAI: OpenAI;

  const mockPrompt: ChatCompletionCreateParams = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello, {{name}}" }],
  };

  const mockChatCompletion: ChatCompletion = {
    id: "chatcmpl-123",
    object: "chat.completion",
    created: 1677652288,
    model: "gpt-3.5-turbo",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Hello, World!",
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 9,
      completion_tokens: 12,
      total_tokens: 21,
    },
  };

  beforeEach(() => {
    mockOpenAI = new OpenAI();

    // Mock implementations
    vi.mocked(traceloop.getPrompt).mockReturnValue(
      JSON.parse(JSON.stringify(mockPrompt)),
    ); // deep copy
    vi.mocked(mockOpenAI.chat.completions.create).mockResolvedValue(
      mockChatCompletion as any,
    ); // The mock is simplified
    vi.mocked(traceloop.withAssociationProperties).mockImplementation(
      async (properties, fn) => {
        return fn();
      },
    );

    // Instantiate the class which uses the mocked OpenAI
    executor = new TraceLoopPromptExecutor();
    (executor as any).openai = mockOpenAI;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute a prompt without properties and return the content", async () => {
    const promptName = "test-prompt";
    const variables = { name: "World" };

    const result = await executor.execute<string>(promptName, variables);

    expect(traceloop.getPrompt).toHaveBeenCalledWith(promptName, variables);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(mockPrompt);
    expect(traceloop.withAssociationProperties).not.toHaveBeenCalled();
    expect(result).toBe("Hello, World!");
  });

  it("should execute a prompt with properties and return the content", async () => {
    const promptName = "test-prompt";
    const variables = { name: "World" };
    const properties = { userId: "123" };

    const result = await executor.execute<string>(
      promptName,
      variables,
      undefined,
      properties,
    );

    expect(traceloop.getPrompt).toHaveBeenCalledWith(promptName, variables);
    expect(traceloop.withAssociationProperties).toHaveBeenCalledWith(
      properties,
      expect.any(Function),
    );
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(mockPrompt);
    expect(result).toBe("Hello, World!");
  });

  it("should override the model if provided", async () => {
    const promptName = "test-prompt";
    const variables = { name: "World" };
    const model = "gpt-4";

    await executor.execute<string>(promptName, variables, model);

    const expectedPrompt = { ...mockPrompt, model };
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expectedPrompt,
    );
  });
});
