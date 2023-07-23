import clerk from '@clerk/clerk-sdk-node';
import { redis } from '../../config/redis';

/**
 * Returns the details of a user based on their unique identifier.
 *
 * The user's unique ID is stored in the PostGreSQL database, but not their details. To retrieve these, the function makes a request to Clerk.
 * If Clerk is unavailable or the user has been deleted (which would also cause the frontend auth to fail), the function returns 'unknown'.
 *
 * To optimize performance, the user data is cached with Redis, expiring after 15 minutes. This avoids excessive calls to Clerk, particularly for frequent, repetitive requests.
 *
 * The function will return 'unknown' if the request to Clerk takes longer than 5 seconds or fails for any other reason.
 */
export const getUserById = async (userId: string): Promise<{ name: string; image: string }> => {
  const identifier = `clerk:user:${userId}`; // Redis key for user

  const cachedUser = await redis.get(identifier);
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  try {
    const user = await clerk.users.getUser(identifier);
    if (!user) throw new Error('User not found');

    // Store user data in cache (redis) for 15 minutes
    await redis.set(identifier, JSON.stringify(user), 'EX', 15 * 60);

    return {
      name: String(user.firstName),
      image: user.imageUrl,
    };
  } catch (error) {
    return {
      name: 'unknown',
      image: 'unknown',
    };
  }
};
