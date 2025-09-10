export class TeamCode {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Team code cannot be empty');
    }
    if (value.length < 3 || value.length > 20) {
      throw new Error('Team code must be between 3 and 20 characters');
    }
    if (!/^[A-Z0-9_]+$/.test(value)) {
      throw new Error('Team code must contain only uppercase letters, numbers, and underscores');
    }
    this.value = value.toUpperCase();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TeamCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
