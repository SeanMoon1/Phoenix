export class TeamId {
  private constructor(private readonly value: number) {
    if (!value || value <= 0) {
      throw new Error('Team ID must be a positive number');
    }
  }

  static create(value: number): TeamId {
    return new TeamId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: TeamId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
