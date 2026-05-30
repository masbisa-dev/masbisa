export type User = {
  id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  user: User;
};
