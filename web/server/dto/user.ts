import { User } from '@mono/db';
import gravatarUrl from 'gravatar-url';

export function userDto(user: User) {
  const { id, name, createdAt } = user;
  const profilePicture = gravatarUrl(user.email, {
    size: 48,
    default: 'identicon'
  });
  return { id, name, createdAt, profilePicture };
}
export type UserDto = ReturnType<typeof userDto>;

export function userFullDto(user: User) {
  const { id, name, createdAt, email } = user;
  const profilePicture = gravatarUrl(user.email, {
    size: 48,
    default: 'identicon'
  });
  return { id, name, createdAt, email, profilePicture };
}
export type UserFullDto = ReturnType<typeof userFullDto>;
