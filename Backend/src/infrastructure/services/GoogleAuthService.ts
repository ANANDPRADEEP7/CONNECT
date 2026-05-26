/**
 * GoogleAuthService - Infrastructure Layer
 * Verifies a Google OAuth2 access_token by calling Google's userinfo endpoint.
 * This works with the @react-oauth/google `useGoogleLogin` hook (implicit flow)
 * which returns an access_token (not an id_token).
 */
export interface GoogleUserInfo {
  sub: string; // Google user ID (unique per user)
  name: string;
  given_name: string;
  family_name?: string;
  email: string;
  email_verified: boolean;
  picture?: string;
}

export class GoogleAuthService {
  private readonly _USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

  async verifyAccessToken(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(this._USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Google token verification failed (${response.status}): ${body}`);
    }

    const userInfo = (await response.json()) as GoogleUserInfo;

    if (!userInfo.email_verified) {
      throw new Error("Google account email is not verified.");
    }

    return userInfo;
  }
}
