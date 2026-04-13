export interface User {
  id?: number | string;
  idUser?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  displayName?: string;
  username?: string;
  status?: string;
}

/**
 * Resolves a display name for a user based on available attributes.
 * Priority: Full Name (First + Last) > Name > DisplayName > Username > Email > ID > "User"
 */
export const getDisplayName = (user: User | null | undefined): string => {
  if (!user) return 'User';

  const fullName = [user.firstName, user.lastName]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join(' ')
    .trim();

  return (
    fullName ||
    user.displayName ||
    user.name ||
    user.username ||
    user.email ||
    user.idUser ||
    String(user.id || '') ||
    'User'
  );
};
