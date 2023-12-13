import { User } from '@mono/db';

export function userDto(user: User) {
  const { id, name, createdAt } = user;
  return { id, name, createdAt };
}
export type UserDto = ReturnType<typeof userDto>;

export function userFullDto(user: User) {
  const { id, name, createdAt, email } = user;
  return { id, name, createdAt, email };
}
export type UserFullDto = ReturnType<typeof userFullDto>;
