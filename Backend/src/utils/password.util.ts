import * as bcrypt from 'bcryptjs';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = 12; // 더 강력한 해시를 위해 12로 증가

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static validatePassword(password: string): boolean {
    // 최소 6자, 소문자와 숫자 포함
    const passwordRegex = /^(?=.*[a-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }

  static generateRandomPassword(length: number = 16): string {
    // 더 강력한 랜덤 비밀번호 생성 (기본 16자)
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  // 비밀번호 강도 검사 (6자 이상, 소문자와 숫자 포함)
  static getPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // 길이 기반 점수 (최소 6자)
    if (password.length >= 6) score += 2;
    else feedback.push('최소 6자 이상이어야 합니다.');

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // 소문자 포함 (필수)
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('소문자를 포함해야 합니다.');

    // 숫자 포함 (필수)
    if (/\d/.test(password)) score += 1;
    else feedback.push('숫자를 포함해야 합니다.');

    // 선택적 요소들 (보너스 점수)
    if (/[A-Z]/.test(password)) score += 1; // 대문자 (선택사항)
    if (/[@$!%*?&]/.test(password)) score += 1; // 특수문자 (선택사항)

    return { score, feedback };
  }
}
