export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface AuthPayload {
  token: string;
  user: Omit<User, 'password'>;
}

export interface Context {
  user?: Omit<User, 'password'>;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
