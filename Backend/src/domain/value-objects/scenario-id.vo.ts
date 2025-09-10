export class ScenarioId {
  private readonly value: number;

  constructor(value: number) {
    if (!value || value <= 0) {
      throw new Error('Scenario ID must be a positive number');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  equals(other: ScenarioId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
