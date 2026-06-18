import { UserRole } from "@/features/users/types/user.type";

export type ContractSessionProfile = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isBanned: boolean;
  profileComplete: boolean;
  avatarUrl: string | null;
};

export type ContractSessionFixture = {
  kind: "guest" | "authenticated";
  uid: string | null;
  email: string | null;
  role: UserRole | null;
  isBanned: boolean;
  profileComplete: boolean;
  sessionToken: string | null;
  refreshToken: string | null;
  profile: ContractSessionProfile | null;
};

function profile(
  uid: string,
  email: string,
  name: string,
  role: UserRole,
  isBanned = false,
): ContractSessionProfile {
  return {
    uid,
    email,
    name,
    role,
    isBanned,
    profileComplete: true,
    avatarUrl: null,
  };
}

function authenticatedFixture(
  uid: string,
  email: string,
  name: string,
  role: UserRole,
  isBanned = false,
): ContractSessionFixture {
  return {
    kind: "authenticated",
    uid,
    email,
    role,
    isBanned,
    profileComplete: true,
    sessionToken: `session-${uid}`,
    refreshToken: `refresh-${uid}`,
    profile: profile(uid, email, name, role, isBanned),
  };
}

export const sessionFixtures = {
  guest: {
    kind: "guest",
    uid: null,
    email: null,
    role: null,
    isBanned: false,
    profileComplete: false,
    sessionToken: null,
    refreshToken: null,
    profile: null,
  },
  user: authenticatedFixture(
    "user-001",
    "user.001@example.test",
    "Regular User",
    UserRole.User,
  ),
  bannedUser: authenticatedFixture(
    "user-banned-001",
    "banned.user@example.test",
    "Banned User",
    UserRole.User,
    true,
  ),
  moderator: authenticatedFixture(
    "moderator-001",
    "moderator.001@example.test",
    "Moderator User",
    UserRole.Moderator,
  ),
  admin: authenticatedFixture(
    "admin-001",
    "admin.001@example.test",
    "Admin User",
    UserRole.Admin,
  ),
} as const satisfies Record<string, ContractSessionFixture>;

export type SessionFixtureName = keyof typeof sessionFixtures;

export function getSessionFixture(
  fixtureName: SessionFixtureName,
): ContractSessionFixture {
  return sessionFixtures[fixtureName];
}
