/**
 * AppContainer – Infrastructure / DI Layer
 * ─────────────────────────────────────────
 * This is the single composition root for the entire application.
 * ALL dependencies are wired here and exposed as lazily-created singletons.
 *
 * Benefits:
 * - Routes and controllers stay thin (no `new` calls scattered around routes).
 * - Easy to swap implementations (e.g. replace InMemoryCache with Redis).
 * - Testable: replace any service with a mock in tests by subclassing this container.
 *
 * Dependency direction (Clean Architecture):
 *   Domain ← Application ← Infrastructure ← (this container) ← Presentation
 */

// ── Infrastructure services ──────────────────────────────────────────────────
import { UserRepository }        from "../repository/Users/UserRepository";
import { JwtTokenService }       from "../services/JwtTokenService";
import { InMemoryCacheService }  from "../services/InMemoryCacheService";
import { GoogleAuthService }     from "../services/GoogleAuthService";
import { NodemailerService }     from "../services/NodemailerService";

// ── Application services ──────────────────────────────────────────────────────
import { EmailService }  from "../../application/services/EmailService";
import { LoggerService } from "../../application/services/LoggerService";

// ── Infrastructure logger ─────────────────────────────────────────────────────
import { WinstonLogger } from "../logging/WinstonLogger";

// ── Application use cases – Auth ──────────────────────────────────────────────
import { SignupUsecase }          from "../../application/useCases/auth/register.usecase";
import { VerifyOtpUseCase }       from "../../application/useCases/auth/verifyOtp.usecase";
import { ResendOtpUseCase }       from "../../application/useCases/auth/resendOtp.usecase";
import { LoginUseCase }           from "../../application/useCases/auth/login.usecase";
import { VerifyEmailUsecase }     from "../../application/useCases/auth/verifyEmail.usecase";
import { ResetPasswordUsecase }   from "../../application/useCases/auth/resetPassword.usecase";
import { GoogleLoginUsecase }     from "../../application/useCases/auth/googleLogin.usecase";

// ── Application use cases – User ─────────────────────────────────────────────
import { GetUserDetailsUseCase }  from "../../application/useCases/user/getUserDetails.usecase";
import { UpdateProfileUseCase }   from "../../application/useCases/user/updateProfile.usecase";

// ── Application use cases – Admin ────────────────────────────────────────────
import { AdminLoginUseCase }      from "../../application/useCases/admin/adminLogin.usecase";
import { GetAllUsersUseCase }     from "../../application/useCases/admin/getAllUsers.usecase";
import { GetAllRidersUseCase }    from "../../application/useCases/admin/getAllRiders.usecase";
import { ToggleBlockUserUseCase } from "../../application/useCases/admin/toggleBlockUser.usecase";
import { UpdateRiderStatusUseCase } from "../../application/useCases/admin/updateRiderStatus.usecase";

// ── Presentation controllers ──────────────────────────────────────────────────
import { UserController }         from "../../presentation/controllers/Auth/auth.controller";
import { UserProfileController }  from "../../presentation/controllers/User/UserProfileController";
import { AdminController }        from "../../presentation/controllers/Admin/admin.controller";

export class AppContainer {
  private static _instance: AppContainer;

  // ── Singletons (lazy-initialised) ──────────────────────────────────────────

  // Infrastructure
  readonly userRepository     = new UserRepository();
  readonly tokenService       = new JwtTokenService();
  readonly cacheService       = new InMemoryCacheService();
  readonly googleAuthService  = new GoogleAuthService();

  // Application services
  private readonly _loggerService  = new LoggerService(new WinstonLogger());
  private readonly _emailService   = new EmailService(new NodemailerService());

  get loggerService()  { return this._loggerService; }
  get emailService()   { return this._emailService; }

  // ── Auth use cases ──────────────────────────────────────────────────────────
  readonly signupUsecase          = new SignupUsecase(this.userRepository, this._emailService);
  readonly verifyOtpUseCase       = new VerifyOtpUseCase(this.userRepository);
  readonly resendOtpUseCase       = new ResendOtpUseCase(this.userRepository, this._emailService);
  readonly loginUseCase           = new LoginUseCase(this.userRepository, this.tokenService);
  readonly verifyEmailUsecase     = new VerifyEmailUsecase(this.userRepository, this._emailService, this.tokenService, this.cacheService);
  readonly resetPasswordUsecase   = new ResetPasswordUsecase(this.userRepository, this.tokenService, this.cacheService);
  readonly googleLoginUsecase     = new GoogleLoginUsecase(this.userRepository, this.googleAuthService, this.tokenService);

  // ── User use cases ──────────────────────────────────────────────────────────
  readonly getUserDetailsUseCase  = new GetUserDetailsUseCase(this.userRepository);
  readonly updateProfileUseCase   = new UpdateProfileUseCase(this.userRepository);

  // ── Admin use cases ─────────────────────────────────────────────────────────
  readonly adminLoginUseCase      = new AdminLoginUseCase(this.userRepository, this.tokenService);
  readonly getAllUsersUseCase      = new GetAllUsersUseCase(this.userRepository);
  readonly getAllRidersUseCase     = new GetAllRidersUseCase(this.userRepository);
  readonly toggleBlockUserUseCase = new ToggleBlockUserUseCase(this.userRepository);
  readonly updateRiderStatusUseCase = new UpdateRiderStatusUseCase(this.userRepository);

  // ── Controllers ─────────────────────────────────────────────────────────────
  readonly authController = new UserController(
    this.signupUsecase,
    this.verifyOtpUseCase,
    this.resendOtpUseCase,
    this.loginUseCase,
    this.verifyEmailUsecase,
    this.resetPasswordUsecase,
    this.googleLoginUsecase,
  );

  readonly userProfileController = new UserProfileController(
    this.updateProfileUseCase,
    this.getUserDetailsUseCase,
  );

  readonly adminController = new AdminController(
    this.adminLoginUseCase,
    this.getAllUsersUseCase,
    this.toggleBlockUserUseCase,
    this.getAllRidersUseCase,
    this.updateRiderStatusUseCase,
  );

  // ── Singleton accessor ──────────────────────────────────────────────────────
  static getInstance(): AppContainer {
    if (!AppContainer._instance) {
      AppContainer._instance = new AppContainer();
    }
    return AppContainer._instance;
  }
}
