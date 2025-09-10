import { applyDecorators } from '@nestjs/common';
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

export function ApiSuccessResponse(description: string, example?: any) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiResponse({
      status: 200,
      description: 'Success',
      example: example || { success: true, message: 'Operation completed successfully' },
    }),
  );
}

export function ApiCreatedResponse(description: string, example?: any) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiResponse({
      status: 201,
      description: 'Created',
      example: example || { success: true, message: 'Resource created successfully' },
    }),
  );
}

export function ApiErrorResponse(description: string, status: number = 400) {
  return applyDecorators(
    ApiOperation({ summary: description }),
    ApiResponse({
      status,
      description: 'Error',
      example: { success: false, message: 'An error occurred' },
    }),
  );
}
