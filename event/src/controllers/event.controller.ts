import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  // Check request body
  if (!request.body) {
    logger.error('Missing request body.');
    throw new CustomError(400, 'Bad request: No Pub/Sub message was received');
  }

  const requestBody = request.body;
  logger.info(JSON.stringify({ requestBody }));

  // Check if the body comes in a message
  if (!requestBody.message) {
    logger.error('Missing body message');
    throw new CustomError(400, 'Bad request: Wrong No Pub/Sub message format');
  }

  // Receive the Pub/Sub message
  const pubSubMessage = requestBody.message;

  // Decode base64 data
  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  // Check if the decoded data is valid
  if (!decodedData) {
    logger.error('Invalid decodedData variable');
    throw new CustomError(400, 'Bad request: Invalid decoded data');
  }

  const jsonData = JSON.parse(decodedData);
  
  if (!jsonData?.order?.id) {
    logger.info('No order id in the Pub/Sub message. Skipping it...');
    return response.status(200).send('No order id in the Pub/Sub message. Skipped!');
  }

  try {
    // Log the complete input event
    logger.info(JSON.stringify({ jsonData }));
    // Store event into a custom object
    const createdCustomObject = await createApiRoot()
      .customObjects()
      .post({
        body: {
          container: 'test-connect-container',
          key: 'test-event-key',
          value: jsonData
        }
      })
      .execute();
    logger.info(JSON.stringify({ createdCustomObject }));
  } catch (error) {
    throw new CustomError(400, `Bad request: ${error}`);
  }

  // Return the response for the client
  response.status(204).send();
};
