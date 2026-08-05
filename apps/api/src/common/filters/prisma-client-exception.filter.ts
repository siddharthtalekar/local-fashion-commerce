import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        response.status(status).json({
          statusCode: status,
          message: `Unique constraint failed on ${target}. This value already exists.`,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: exception.meta?.cause || 'Record not found.',
          error: 'Not Found',
        });
        break;
      }
      case 'P2003': {
        const status = HttpStatus.BAD_REQUEST;
        response.status(status).json({
          statusCode: status,
          message: 'Foreign key constraint failed. Related record might not exist.',
          error: 'Bad Request',
        });
        break;
      }
      default:
        // Default 500 error for unhandled Prisma codes
        const defaultStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(defaultStatus).json({
          statusCode: defaultStatus,
          message: 'An unexpected database error occurred.',
          error: 'Internal Server Error',
        });
        break;
    }
  }
}
