export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isRiderActive: string | undefined;
  isBlocked: boolean;
}

export interface IGetUserDetailsUseCase {
  execute(userId: string): Promise<User>;
}
