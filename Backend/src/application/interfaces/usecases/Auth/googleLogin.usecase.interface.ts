interface GoogleLoginResponse {
  message: string;
  token: string;
  user: GoogleUser;
}

interface GoogleUser {
  id: string;
  name: string;
  email: string;
  role: string;
}


export interface IGoogleLoginUsecase{
  execute(accessToken: string):Promise<GoogleLoginResponse>
}