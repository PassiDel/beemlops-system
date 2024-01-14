import { Team, User } from '@mono/db';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';
import { H3Event } from 'h3';
import { createPrismaAbility } from '~/server/casl/prisma';

declare module 'h3' {
  interface H3EventContext {
    ability: ReturnType<typeof defineAbilityFor>;
  }
}

export function defineAbilityFor(user: { id: number } | null) {
  type Actions = 'create' | 'read' | 'read:full' | 'list' | 'update' | 'delete';
  type PrismaSubjects = {
    User: User;
    Team: Team;
  };
  type AppAbility = PureAbility<
    [Actions, Subjects<PrismaSubjects>],
    PrismaQuery
  >;

  const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

  const { can: allow, cannot: deny, build } = builder;
  if (user) {
    // Authed user

    allow(['list', 'create'], 'Team');
    allow('read', 'User');
    allow(['update', 'read:full', 'delete'], 'User', { id: user.id });

    allow('read', 'Team', {
      OR: [{ users: { some: { userId: user.id } } }, { creatorId: user.id }]
    }).because('is member');

    allow(['update', 'delete', 'read:full'], 'Team', {
      creatorId: user.id
    }).because('is creator');
    allow(['update', 'delete', 'read:full'], 'Team', {
      creator: { is: { id: user.id } }
    }).because('is creator');

    // Deleted entities
    deny(['update', 'delete', 'read', 'read:full'], 'User', {
      deletedAt: { not: null }
    }).because('is deleted');
    deny(['update', 'delete', 'read', 'read:full'], 'Team', {
      deletedAt: { not: null }
    }).because('is deleted');
  }
  // Public user
  allow('list', 'User');

  return build();
}

export function useAbility(event: H3Event) {
  return event.context.ability;
}
