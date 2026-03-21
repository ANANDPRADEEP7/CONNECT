import { User } from "../../../domain/entities/User/user.entities";

/**
 * UserMapper – Application Layer
 * Transforms between the raw User entity and safe public-facing representations.
 * Ensures sensitive fields (e.g. password) are never leaked in API responses.
 */
export class UserMapper {
  /**
   * Strip sensitive fields – use this for any API response that returns user data.
   */
  static toPublicProfile(user: User): Omit<User, "password"> {
    const { password, ...publicUser } = user;
    return publicUser;
  }

  /**
   * Map an array of users to public profiles.
   */
  static toPublicProfileList(users: User[]): Omit<User, "password">[] {
    return users.map(UserMapper.toPublicProfile);
  }
}
