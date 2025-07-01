import { beforeAll, describe, expect, it, vi } from "vitest";
import { TraceLoopPromptExecutor } from "../src/TraceLoopPromptExecutor";
import * as traceloop from "@traceloop/node-server-sdk";
import OpenAI from "openai";

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
    const jobDescription = `🟢  DevOps Senior в Наполеон ИТ

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

    const variables = { jobDescription };

    const result = await executor.execute(promptName, variables, process.env.OPENAI_MODEL);

    expect(result).toBe('(DevOps OR "DevOps Engineer" OR "SRE" OR "Site Reliability Engineer" OR "инженер DevOps") AND (Spark) AND (Kubernetes OR K8S) AND (Docker) AND (Linux) AND (Cloud OR "облачные технологии" OR "Cloud computing") AND (Terraform) AND ("CI/CD" OR "Continuous Integration" OR "Continuous Delivery" OR "Continuous Deployment") AND (Yandex.Cloud OR "Yandex Cloud") AND (Alluxio) AND (sklearn OR tensorflow OR "ML")');
  });
});
