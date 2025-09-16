export class SessionCode {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error(
        'Invalid session code: must be 3-50 characters, alphanumeric and underscores only',
      );
    }
    this.value = value.toUpperCase();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SessionCode): boolean {
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
    if (trimmed.length < 3 || trimmed.length > 50) {
      return false;
    }

    // 영문자, 숫자, 언더스코어만 허용
    const validPattern = /^[A-Z0-9_]+$/i;
    return validPattern.test(trimmed);
  }
}
