import { beforeAll, describe, expect, it, vi } from "vitest";
import { TraceLoopPromptExecutor } from "../src/TraceLoopPromptExecutor";
import * as traceloop from "@traceloop/node-server-sdk";
import OpenAI from "openai";

const jobDescriptionDevOps = `DevOps Senior

Требования:
●Spark
●Kubernetes
●Docker - от 2х лет
●K8S - от 1 года
●Linux - от 2х лет
●Cloud - от 1 года
●Terraform - от 1 года
●Средства ML: sklearn, tensorflow будут плюсом

Задачи:
●Перевод с Managed Yandex.Cloud в Kubernetes, шифрация данных, создание прод. среды, конвейеров, CI/CD, помощь в настройке мониторинга и разработка Spark скриптов.
●Миграция из Managed Service в собственные Kubernetes
●Разработка CI/CD конвейеров. 1 DevOps/1 DE
●Разработка модулей для Alluxio.
●I&D. Разработка модулей для поддержки промышленной системы.
●Разработка модулей межсервисного шифрования.
●Разработка общего метахранилища.
●I&D. Разработка мониторинга сервисов и инфраструктуры.
`;

describe("TraceLoopPromptExecutor", () => {
  let executor: TraceLoopPromptExecutor;

  beforeAll(async () => {
    traceloop.initialize({
      appName: "promptexexutortest",
      apiKey: process.env.TRACELOOP_API_KEY,
      disableBatch: true,
      traceloopSyncEnabled: true,
      instrumentModules: {
        openAI: OpenAI,
      },
    });

    await traceloop.waitForInitialization();

    // Instantiate the class which uses the mocked OpenAI
    executor = new TraceLoopPromptExecutor();
  });

  it("should execute a prompt without properties and return the content", async () => {
    const promptName = "extractSearchFromJob";

    const variables = { jobDescription: jobDescriptionDevOps };

    const result = await executor.execute<string>(
      promptName,
      variables,
      process.env.OPENAI_MODEL
    );

    expect(result).not.toBeNull();
    // The AI's response can be non-deterministic, so we check for keywords instead of a strict match.
    if (result) {
      expect(result).toContain("DevOps");
      expect(result).toContain("Spark");
      expect(result).toContain("Docker");
      expect(result).toContain("Linux");
      expect(result).toContain("Cloud");
      expect(result).toContain("Terraform");
      expect(result).toContain("CI/CD");
      expect(result).toContain("Alluxio");
    }
  });
});
