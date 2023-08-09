import { Request, Response } from 'express';

import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { allOrders } from '../orders/fetch.orders';
import { createApiRoot } from '../client/create.client';

/**
 * Exposed job endpoint.
 *
 * @param {Request} _request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (_request: Request, response: Response) => {
  try {
    // Get the orders
    const limitedOrdersObject = await allOrders({ sort: ['lastModifiedAt'] });
    logger.info(`There are ${limitedOrdersObject.total} orders!`);

    const customObject = await createApiRoot()
    .customObjects()
    .post({
      body: {
        container: 'test-connect-container',
        key: 'test-job-key',
        value: `There are ${limitedOrdersObject.total} orders!`
      }
    })
    .execute();

    logger.info(JSON.stringify({ customObject }));

    response.status(200).send();
  } catch (error) {
    throw new CustomError(
      500,
      `Internal Server Error - Error retrieving all orders from the commercetools SDK`
    );
  }
};
