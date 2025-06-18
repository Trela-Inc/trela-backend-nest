import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ErrorHandlerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (body: any) {
      // Log request
      this.logger.log(`${req.method} ${req.url} - ${res.statusCode}`);

      // Handle errors
      if (res.statusCode >= 400) {
        this.logger.error(`Error ${res.statusCode}: ${body}`);
        
        // Standardize error response
        const errorResponse = {
          success: false,
          error: {
            code: res.statusCode,
            message: this.getErrorMessage(res.statusCode, body),
            timestamp: new Date().toISOString(),
            path: req.url,
          },
        };

        return originalSend.call(this, JSON.stringify(errorResponse));
      }

      // Success response
      const successResponse = {
        success: true,
        data: body,
        timestamp: new Date().toISOString(),
      };

      return originalSend.call(this, JSON.stringify(successResponse));
    };

    next();
  }

  private getErrorMessage(statusCode: number, body: any): string {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        return parsed.message || parsed.error || 'An error occurred';
      } catch {
        return body || 'An error occurred';
      }
    }

    if (typeof body === 'object') {
      return body.message || body.error || 'An error occurred';
    }

    switch (statusCode) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 500:
        return 'Internal Server Error';
      default:
        return 'An error occurred';
    }
  }
} 