/**
 * User Model Types
 *
 * Defines TypeScript interfaces for User entities and related data structures
 * used throughout the authentication system.
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  totpSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * Removes sensitive fields from User object before sending to client
 */
export function toPublicUser(user: User): UserPublic {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
