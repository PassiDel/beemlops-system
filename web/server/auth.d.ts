declare module '#auth-utils' {
  interface UserSession {
    user: {
      id: number;
      name: string;
    };
    loggedInAt: string | Date;
  }
}
