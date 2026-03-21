/**
 * RegisterUserDTO – Domain Layer
 * Describes the data required to register a new user.
 * Used as input to the SignupUsecase.
 */
export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  phonenumber?: string;
}
