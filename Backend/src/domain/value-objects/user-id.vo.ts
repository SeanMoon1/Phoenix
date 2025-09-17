export class UserId {
  private constructor(private readonly value: number) {
    if (!value || value <= 0) {
      throw new Error('User ID must be a positive number');
    }
  }

  static create(value: number | undefined): UserId {
    if (value === undefined) {
      return new UserId(0); // 임시 ID, 실제로는 DB에서 생성됨
    }
    return new UserId(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}
