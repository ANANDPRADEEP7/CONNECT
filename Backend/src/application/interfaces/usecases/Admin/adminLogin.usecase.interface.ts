interface AdminLoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  admin: Admin;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface IAdminLoginUseCase {
  execute(email: string, password: string): Promise<AdminLoginResponse>;
}
