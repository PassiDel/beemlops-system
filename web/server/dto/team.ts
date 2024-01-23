import { HiveLocation, Team, TeamUser, User } from '@mono/db';
import { userDto } from '~/server/dto/user';
import {
  FullHiveLocation,
  locationDto,
  locationHiveDto
} from '~/server/dto/hive';

type FullTeam = Team & { users: (TeamUser & { user: User })[] } & {
  creator: User;
};

type TeamLocationHive = FullTeam & { locations: FullHiveLocation[] };
type TeamLocation = FullTeam & { locations: HiveLocation[] };

export function teamDto(team: FullTeam, isCreator = false) {
  const { id, name, slug, createdAt, users: teamUsers, creator } = team;

  const users = teamUsers.map((u) => userDto(u.user));

  return {
    id,
    name,
    slug,
    createdAt,
    creator: userDto(creator),
    users,
    isCreator
  };
}

export type TeamDto = ReturnType<typeof teamDto>;

export function teamLocationHiveDto(team: TeamLocationHive, isCreator = false) {
  const dto = teamDto(team, isCreator);

  return { ...dto, locations: team.locations.map(locationHiveDto) };
}

export type TeamLocationHiveDto = ReturnType<typeof teamLocationHiveDto>;

export function teamLocationDto(team: TeamLocation, isCreator = false) {
  const dto = teamDto(team, isCreator);

  return { ...dto, locations: team.locations.map(locationDto) };
}

export type TeamLocationDto = ReturnType<typeof teamLocationDto>;
