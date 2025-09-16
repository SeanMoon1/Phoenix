export class ScenarioId {
  private readonly value: number;

  constructor(value: number) {
    if (!this.isValid(value)) {
      throw new Error('Invalid scenario ID: must be a positive number');
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

  private isValid(value: number): boolean {
    return Number.isInteger(value) && value > 0;
  }
}
