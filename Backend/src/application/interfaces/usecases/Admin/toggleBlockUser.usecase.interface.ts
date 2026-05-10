export interface ToggleBlockUserResponse {
  message: string;
  isBlocked: boolean;
}

export interface IToggleBlockUserUseCase {
  execute(userId: string): Promise<ToggleBlockUserResponse>;
}
