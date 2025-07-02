export interface Parser<T> {
  parse(input: string | null): T | null;
}

export class DefaultParser implements Parser<string> {
  public parse(input: string | null): string | null {
    return input;
  }
}

export class JsonParser<T = any> implements Parser<T> {
  public parse(input: string | null): T | null {
    if (!input) {
      return null;
    }
    input = input.replace(/```json\n/, "").replace(/```/, "");

    try {
      return JSON.parse(input);
    } catch (e) {
      console.error("Failed to parse content as JSON", {
        content: input,
        error: e,
      });
      return null;
    }
  }
}
