export class TeamCode {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error(
        'Invalid team code: must be 3-20 characters, uppercase letters, numbers, and underscores only',
      );
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

  private isValid(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 20) {
      return false;
    }

    // 대문자, 숫자, 언더스코어만 허용
    const validPattern = /^[A-Z0-9_]+$/;
    return validPattern.test(trimmed);
  }
}
