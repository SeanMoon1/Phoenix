/**
 * 숫자 유틸리티 함수들
 * NaN 방지 및 안전한 숫자 변환을 위한 헬퍼 함수들
 */

/**
 * 안전한 정수 변환
 * @param value 변환할 값
 * @param defaultValue 변환 실패 시 기본값
 * @returns 변환된 정수 또는 기본값
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 안전한 실수 변환
 * @param value 변환할 값
 * @param defaultValue 변환 실패 시 기본값
 * @returns 변환된 실수 또는 기본값
 */
export function safeParseFloat(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  const parsed = parseFloat(String(value));
  return isNaN(parsed) || !isFinite(parsed) ? defaultValue : parsed;
}

/**
 * 숫자 값 검증
 * @param value 검증할 값
 * @param fieldName 필드명 (에러 메시지용)
 * @throws BadRequestException 유효하지 않은 값인 경우
 */
export function validateNumericValue(value: any, fieldName: string): number {
  if (value === null || value === undefined) {
    throw new Error(`Field '${fieldName}' is required`);
  }

  const numValue = Number(value);
  if (isNaN(numValue) || !isFinite(numValue)) {
    throw new Error(`Invalid numeric value for field '${fieldName}': ${value}`);
  }

  return numValue;
}

/**
 * 숫자 배열 검증
 * @param values 검증할 값 배열
 * @param fieldName 필드명 (에러 메시지용)
 * @returns 검증된 숫자 배열
 */
export function validateNumericArray(
  values: any[],
  fieldName: string,
): number[] {
  if (!Array.isArray(values)) {
    throw new Error(`Field '${fieldName}' must be an array`);
  }

  return values.map((value, index) =>
    validateNumericValue(value, `${fieldName}[${index}]`),
  );
}
