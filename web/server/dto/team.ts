import { Team, TeamUser, User } from '@mono/db';
import { userDto } from '~/server/dto/user';

type FullTeam = Team & { users: (TeamUser & { user: User })[] } & {
  creator: User;
};

export function teamDto(team: FullTeam) {
  const { id, name, slug, createdAt, users: teamUsers, creator } = team;

  const users = teamUsers.map((u) => userDto(u.user));

  return { id, name, slug, createdAt, creator: userDto(creator), users };
}

export type TeamDto = ReturnType<typeof teamDto>;
