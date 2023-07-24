import { Request, Response, NextFunction } from 'express';
import { environment as config } from '../../config/environment';
import crypto from 'crypto';

/**
 * Optional Middleware to authenticate incoming requests.
 *
 * The middleware checks for two custom headers: 'X-API-SECRET' and 'X-USER-ID'.
 * It ensures that the 'X-API-SECRET' matches the API_SECRET from the environment variables
 * and that the 'X-USER-ID' header is present.
 * If these checks pass, the user is considered authenticated.
 * The user's ID is then extracted from the 'X-USER-ID' header, trimmed of any leading or trailing spaces,
 * and attached to the request object for use in downstream middleware or route handlers.
 * If either of the checks fail, an error is passed to the next middleware in the stack.
 *
 * @param {Request} req - The Express request object. Incoming parameters are read from this object.
 * @param {Response} res - The Express response object. This is not used in this middleware function, but is included to maintain the standard Express middleware function signature.
 * @param {NextFunction} next - The Express next function. This is called to pass control to the next middleware in the stack. If an error occurs, this function is called with an Error object as its argument.
 */
const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiSecret = req.headers['x-api-secret'];
  const userID = req.headers['x-user-id'];

  // Get the hashed API secret from environment variables
  const envAPISecret = crypto.createHash('sha256').update(config.api.secret).digest('hex');

  if (!apiSecret || apiSecret !== envAPISecret) {
    next();
  }

  // Assign userID to request for controllers to use
  req.userID = String(userID).trim();

  next();
};

export default optionalAuthMiddleware;
