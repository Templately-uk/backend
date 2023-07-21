import clerk from '@clerk/clerk-sdk-node';

export const getUserById = async (id: string): Promise<{ name: string; image: string }> => {
  const user = await clerk.users.getUser(id);
  if (!user) {
    return {
      name: 'unknown',
      image: 'unknown',
    };
  }
  return {
    name: String(user.firstName),
    image: user.imageUrl,
  };
};
