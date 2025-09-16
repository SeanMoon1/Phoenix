import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiResponseOptions } from '@nestjs/swagger';

export const ApiResponseDecorator = <TModel extends Type<any>>(
  model: TModel,
  options?: ApiResponseOptions,
) => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: '성공',
      type: model,
      ...options,
    }),
  );
};

export const ApiErrorResponse = (status: number, description: string) => {
  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: status },
          message: { type: 'string', example: description },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
  );
};
