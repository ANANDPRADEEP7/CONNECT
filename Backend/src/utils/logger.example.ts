// // Example usage of logger in different parts of your application

// import { Request, Response } from 'express';
// import logger from './logger.js';

// // 1. Basic logging
// logger.info('Application started');
// logger.error('Something went wrong');
// logger.warn('Warning message');
// logger.debug('Debug information');

// // 2. Logging with objects
// logger.info('User data:', { userId: 123, email: 'user@example.com' });

// // 3. Logging in routes
// export const exampleRouteHandler = (req:Request, res:Response) => {
//   logger.info(`Processing request for ${req.method} ${req.path}`);

//   try {
//     // Your logic here
//     logger.info('Request processed successfully');
//     res.json({ success: true });
//   } catch (error:unknown) {
//     if(error instanceof Error)
//     logger.error(`Request failed: ${error.message}`, { stack: error.stack });
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // 4. Logging in services/use cases
// export class ExampleService {
//   async processData(data: any) {
//     logger.debug('Starting data processing', { dataSize: data.length });

//     try {
//       // Processing logic
//       const result = await this.doProcess(data);

//       logger.info('Data processing completed', {
//         processedItems: result.length,
//         duration: Date.now() - startTime
//       });

//       return result;
//     } catch (error:unknown) {
//       if(error instanceof Error)
//       logger.error('Data processing failed', {
//         error: error.message,
//         inputSize: data.length
//       });
//       throw error;
//     }
//   }
// }

// // 5. Environment-specific logging
// if (process.env.NODE_ENV === 'development') {
//   logger.debug('Development mode - verbose logging enabled');
// } else {
//   logger.info('Production mode - minimal logging');
// }

// // 6. Performance logging
// const startTime = Date.now();
// // ... some operation
// const duration = Date.now() - startTime;
// logger.info(`Operation completed in ${duration}ms`);
