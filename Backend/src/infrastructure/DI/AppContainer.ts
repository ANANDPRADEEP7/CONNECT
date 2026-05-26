// ── Infrastructure services ──────────────────────────────────────────────────
import { UserRepository } from "../repository/Users/UserRepository";
import { RideRepository } from "../repository/Rides/RideRepository";
import { JwtTokenService } from "../services/JwtTokenService";
import { InMemoryCacheService } from "../services/InMemoryCacheService";
import { GoogleAuthService } from "../services/GoogleAuthService";
import { NodemailerService } from "../services/NodemailerService";

// ── Application services ──────────────────────────────────────────────────────
import { EmailService } from "../../application/services/EmailService";
import { LoggerService } from "../../application/services/LoggerService";

// ── Infrastructure logger ─────────────────────────────────────────────────────
import { WinstonLogger } from "../logging/WinstonLogger";

// ── Application use cases – Auth ──────────────────────────────────────────────
import { SignupUsecase } from "../../application/useCases/auth/register.usecase";
import { VerifyOtpUseCase } from "../../application/useCases/auth/verifyOtp.usecase";
import { ResendOtpUseCase } from "../../application/useCases/auth/resendOtp.usecase";
import { LoginUseCase } from "../../application/useCases/auth/login.usecase";
import { VerifyEmailUsecase } from "../../application/useCases/auth/verifyEmail.usecase";
import { ResetPasswordUsecase } from "../../application/useCases/auth/resetPassword.usecase";
import { GoogleLoginUsecase } from "../../application/useCases/auth/googleLogin.usecase";

// ── Application use cases – User ─────────────────────────────────────────────
import { GetUserDetailsUseCase } from "../../application/useCases/user/getUserDetails.usecase";
import { UpdateProfileUseCase } from "../../application/useCases/user/updateProfile.usecase";

// ── Application use cases – Admin ────────────────────────────────────────────
import { AdminLoginUseCase } from "../../application/useCases/admin/adminLogin.usecase";
import { GetAllUsersUseCase } from "../../application/useCases/admin/getAllUsers.usecase";
import { GetAllRidersUseCase } from "../../application/useCases/admin/getAllRiders.usecase";
import { ToggleBlockUserUseCase } from "../../application/useCases/admin/toggleBlockUser.usecase";
import { UpdateRiderStatusUseCase } from "../../application/useCases/admin/updateRiderStatus.usecase";

// ── Application use cases – Ride ─────────────────────────────────────────────
import { CreateRideUseCase } from "../../application/useCases/ride/createRide.usecase";
import { GetRidesUseCase } from "../../application/useCases/ride/getRides.usecase";
import { GetMyRidesUseCase } from "../../application/useCases/ride/getMyRides.usecase";

// ── Presentation controllers ──────────────────────────────────────────────────
import { UserController } from "../../presentation/controllers/Auth/auth.controller";
import { UserProfileController } from "../../presentation/controllers/User/UserProfileController";
import { AdminController } from "../../presentation/controllers/Admin/admin.controller";
import { RideController } from "../../presentation/controllers/Ride/ride.controller";

export class AppContainer {
  private static _instance: AppContainer;

  // Infrastructure
  private readonly _userRepository = new UserRepository();
  private readonly _rideRepository = new RideRepository();
  private readonly _tokenService = new JwtTokenService();
  private readonly _cacheService = new InMemoryCacheService();
  private readonly _googleAuthService = new GoogleAuthService();

  // Application services
  private readonly _loggerService = new LoggerService(new WinstonLogger());
  private readonly _emailService = new EmailService(new NodemailerService());

  get loggerService() {
    return this._loggerService;
  }
  get emailService() {
    return this._emailService;
  }
  get tokenService() {
    return this._tokenService;
  }

  // ── Auth use cases ──────────────────────────────────────────────────────────
  private readonly _signupUsecase = new SignupUsecase(this._userRepository, this._emailService);
  private readonly _verifyOtpUseCase = new VerifyOtpUseCase(this._userRepository);
  private readonly _resendOtpUseCase = new ResendOtpUseCase(
    this._userRepository,
    this._emailService,
  );
  private readonly _loginUseCase = new LoginUseCase(this._userRepository, this._tokenService);
  private readonly _verifyEmailUsecase = new VerifyEmailUsecase(
    this._userRepository,
    this._emailService,
    this._tokenService,
    this._cacheService,
  );
  private readonly _resetPasswordUsecase = new ResetPasswordUsecase(
    this._userRepository,
    this._tokenService,
    this._cacheService,
  );
  private readonly _googleLoginUsecase = new GoogleLoginUsecase(
    this._userRepository,
    this._googleAuthService,
    this._tokenService,
  );

  // ── User use cases ──────────────────────────────────────────────────────────
  private readonly _getUserDetailsUseCase = new GetUserDetailsUseCase(this._userRepository);
  private readonly _updateProfileUseCase = new UpdateProfileUseCase(this._userRepository);

  // ── Admin use cases ─────────────────────────────────────────────────────────
  private readonly _adminLoginUseCase = new AdminLoginUseCase(
    this._userRepository,
    this._tokenService,
  );
  private readonly _getAllUsersUseCase = new GetAllUsersUseCase(this._userRepository);
  private readonly _getAllRidersUseCase = new GetAllRidersUseCase(this._userRepository);
  private readonly _toggleBlockUserUseCase = new ToggleBlockUserUseCase(this._userRepository);
  private readonly _updateRiderStatusUseCase = new UpdateRiderStatusUseCase(this._userRepository);

  // ── Ride use cases ──────────────────────────────────────────────────────────
  private readonly _createRideUseCase = new CreateRideUseCase(this._rideRepository);
  private readonly _getRidesUseCase = new GetRidesUseCase(this._rideRepository);
  private readonly _getMyRidesUseCase = new GetMyRidesUseCase(this._rideRepository);

  // Controllers
  readonly authController = new UserController(
    this._signupUsecase,
    this._verifyOtpUseCase,
    this._resendOtpUseCase,
    this._loginUseCase,
    this._verifyEmailUsecase,
    this._resetPasswordUsecase,
    this._googleLoginUsecase,
    this._getUserDetailsUseCase,
    this._tokenService,
  );

  readonly userProfileController = new UserProfileController(
    this._updateProfileUseCase,
    this._getUserDetailsUseCase,
  );

  readonly adminController = new AdminController(
    this._adminLoginUseCase,
    this._getAllUsersUseCase,
    this._toggleBlockUserUseCase,
    this._getAllRidersUseCase,
    this._updateRiderStatusUseCase,
    this._getUserDetailsUseCase,
  );

  readonly rideController = new RideController(
    this._createRideUseCase,
    this._getRidesUseCase,
    this._getMyRidesUseCase,
  );

  // Singleton accessor
  static getInstance(): AppContainer {
    if (!AppContainer._instance) {
      AppContainer._instance = new AppContainer();
    }
    return AppContainer._instance;
  }
}
