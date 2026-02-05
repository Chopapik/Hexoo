export interface AuthService {
  logoutUser(): Promise<{ message: string }>;
  createSession(
    idToken: string,
    ip: string,
  ): Promise<{
    user: {
      uid: string;
      email: string | undefined;
      name: string;
      role: string;
      avatarUrl?: string;
    };
  }>;
  registerUser(data: {
    idToken: string;
    name: string;
    email: string;
  }): Promise<{
    user: {
      uid: string;
      name: string;
      email: string | undefined;
      role: "user";
    };
  }>;
  checkEmailAvailability(email: string): Promise<{
    available: boolean;
    email: string;
  }>;
  checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    username: string;
  }>;
}
