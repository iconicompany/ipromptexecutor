import { beforeAll, describe, expect, it, vi } from "vitest";
import { TraceLoopPromptExecutor } from "../src/TraceLoopPromptExecutor";
import * as traceloop from "@traceloop/node-server-sdk";
import OpenAI from "openai";
import { JsonParser } from "../src/Parser";

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
  beforeAll(async () => {
    traceloop.initialize({
      appName: "promptexecutortest",
      apiKey: process.env.TRACELOOP_API_KEY,
      disableBatch: true,
      traceloopSyncEnabled: true,
      instrumentModules: {
        openAI: OpenAI,
      },
    });

    await traceloop.waitForInitialization();

    // Instantiate the class which uses the mocked OpenAI
  });

  it("should execute a prompt extractSearchFromJob and return the content", async () => {
    const executor = new TraceLoopPromptExecutor();

    const promptName = "extractSearchFromJob";
    const modelName = process.env.OPENAI_MODEL;

    const variables = { jobDescription: jobDescriptionDevOps };

    const result = await executor.execute<string>(
      promptName,
      variables,
      modelName
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
  it("should execute a prompt extractSkillsFromJob and return the content", async () => {
    const executor = new TraceLoopPromptExecutor();

    const promptName = "extractSkillsFromJob";
    const modelName = process.env.OPENAI_MODEL;

    const variables = { jobDescription: jobDescriptionDevOps };

    const result = await executor.execute<any>(
      promptName,
      variables,
      modelName,
      new JsonParser()
    );

    expect(result).not.toBeNull();
    // The AI's response can be non-deterministic, so we check for keywords instead of a strict match.
    if (result) {
      expect(result.Docker).toBe(2);
      expect(result.Terraform).toBe(1);
    }
  });
  it("should execute a prompt parseJob and return the content", async () => {
    const executor = new TraceLoopPromptExecutor();

    const promptName = "parseJob";
    const modelName = process.env.OPENAI_MODEL;

    const variables = { jobDescription: jobDescriptionDevOps };

    const result = await executor.execute<any>(
      promptName,
      variables,
      modelName,
      new JsonParser()
    );

    expect(result).not.toBeNull();
    // The AI's response can be non-deterministic, so we check for key structural elements and values.
    if (result) {
      expect(result).toHaveProperty("job");
      const { job } = result;
      expect(job.specialization).toBe("DevOps");
      expect(job.grades).toEqual(expect.arrayContaining(["Senior"]));
      expect(job.mandatoryRequirements).toEqual(
        expect.arrayContaining([
          "Spark",
          "Kubernetes",
          "Docker - от 2х лет",
          "Terraform - от 1 года",
        ])
      );
      // expect(job.additionalRequirements).toEqual(
      //   expect.arrayContaining(["Средства ML: sklearn, tensorflow будут плюсом"])
      // );
      expect(job.projectTasks).toEqual(
        expect.arrayContaining([
          "Разработка CI/CD конвейеров.",
          "Миграция из Managed Service в собственные Kubernetes",
        ])
      );
    }
  });
});
