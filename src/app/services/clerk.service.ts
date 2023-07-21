import clerk from '@clerk/clerk-sdk-node';

export const getUserById = async (id: string): Promise<{ name: string; image: string }> => {
  const user = await clerk.users.getUser(id);

  if (!user) throw new Error('User not found');

  return {
    name: String(user.firstName),
    image: String(user.imageUrl),
  };
};
