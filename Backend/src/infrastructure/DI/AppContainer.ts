// ── Infrastructure services ──────────────────────────────────────────────────
import { UserRepository } from "../repository/Users/UserRepository";
import { RideRepository } from "../repository/Rides/RideRepository";
import { VehicleRepository } from "../repository/Vehicles/VehicleRepository";
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
import { UpdatePersonalInfoUseCase } from "../../application/useCases/user/updatePersonalInfo.usecase";

// ── Application use cases – Admin ────────────────────────────────────────────
import { AdminLoginUseCase } from "../../application/useCases/admin/adminLogin.usecase";
import { GetAllUsersUseCase } from "../../application/useCases/admin/getAllUsers.usecase";
import { GetAllRidersUseCase } from "../../application/useCases/admin/getAllRiders.usecase";
import { ToggleBlockUserUseCase } from "../../application/useCases/admin/toggleBlockUser.usecase";
import { UpdateRiderStatusUseCase } from "../../application/useCases/admin/updateRiderStatus.usecase";
import { GetAdminRidesUseCase } from "../../application/useCases/admin/getAdminRides.usecase";
import { UpdateAdminRideStatusUseCase } from "../../application/useCases/admin/updateAdminRideStatus.usecase";
import { DeleteAdminRideUseCase } from "../../application/useCases/admin/deleteAdminRide.usecase";

// ── Application use cases – Ride ─────────────────────────────────────────────
import { CreateRideUseCase } from "../../application/useCases/ride/createRide.usecase";
import { GetRidesUseCase } from "../../application/useCases/ride/getRides.usecase";
import { GetMyRidesUseCase } from "../../application/useCases/ride/getMyRides.usecase";
import { GetRideByIdUseCase } from "../../application/useCases/ride/getRideById.usecase";
import { UpdateRideUseCase } from "../../application/useCases/ride/updateRide.usecase";
import { CancelRideUseCase } from "../../application/useCases/ride/cancelRide.usecase";
import { DeleteRideUseCase } from "../../application/useCases/ride/deleteRide.usecase";
import { SearchRidesUseCase } from "../../application/useCases/ride/searchRides.usecase";

// ── Application use cases – Vehicle ──────────────────────────────────────────
import { CreateVehicleUseCase } from "../../application/useCases/vehicle/createVehicle.usecase";
import { GetMyVehiclesUseCase } from "../../application/useCases/vehicle/getMyVehicles.usecase";
import { GetVehicleByIdUseCase } from "../../application/useCases/vehicle/getVehicleById.usecase";
import { UpdateVehicleUseCase } from "../../application/useCases/vehicle/updateVehicle.usecase";
import { DeleteVehicleUseCase } from "../../application/useCases/vehicle/deleteVehicle.usecase";

// ── Presentation controllers ──────────────────────────────────────────────────
import { UserController } from "../../presentation/controllers/Auth/auth.controller";
import { UserProfileController } from "../../presentation/controllers/User/UserProfileController";
import { AdminController } from "../../presentation/controllers/Admin/admin.controller";
import { RideController } from "../../presentation/controllers/Ride/ride.controller";
import { VehicleController } from "../../presentation/controllers/Vehicle/vehicle.controller";

export class AppContainer {
  private static _instance: AppContainer;

  // Infrastructure
  private readonly _userRepository = new UserRepository();
  private readonly _rideRepository = new RideRepository();
  private readonly _vehicleRepository = new VehicleRepository();
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
  private readonly _updatePersonalInfoUseCase = new UpdatePersonalInfoUseCase(this._userRepository);

  // ── Admin use cases ─────────────────────────────────────────────────────────
  private readonly _adminLoginUseCase = new AdminLoginUseCase(
    this._userRepository,
    this._tokenService,
  );
  private readonly _getAllUsersUseCase = new GetAllUsersUseCase(this._userRepository);
  private readonly _getAllRidersUseCase = new GetAllRidersUseCase(
    this._userRepository,
    this._vehicleRepository,
  );
  private readonly _toggleBlockUserUseCase = new ToggleBlockUserUseCase(this._userRepository);
  private readonly _updateRiderStatusUseCase = new UpdateRiderStatusUseCase(this._userRepository);
  private readonly _getAdminRidesUseCase = new GetAdminRidesUseCase(
    this._rideRepository,
    this._userRepository,
    this._vehicleRepository,
  );
  private readonly _updateAdminRideStatusUseCase = new UpdateAdminRideStatusUseCase(this._rideRepository);
  private readonly _deleteAdminRideUseCase = new DeleteAdminRideUseCase(this._rideRepository);

  // ── Ride use cases ──────────────────────────────────────────────────────────
  private readonly _createRideUseCase = new CreateRideUseCase(this._rideRepository);
  private readonly _getRidesUseCase = new GetRidesUseCase(this._rideRepository);
  private readonly _getMyRidesUseCase = new GetMyRidesUseCase(this._rideRepository);
  private readonly _getRideByIdUseCase = new GetRideByIdUseCase(this._rideRepository);
  private readonly _updateRideUseCase = new UpdateRideUseCase(this._rideRepository);
  private readonly _cancelRideUseCase = new CancelRideUseCase(this._rideRepository);
  private readonly _deleteRideUseCase = new DeleteRideUseCase(this._rideRepository);
  private readonly _searchRidesUseCase = new SearchRidesUseCase(
    this._rideRepository,
    this._userRepository,
    this._vehicleRepository,
  );

  // ── Vehicle use cases ───────────────────────────────────────────────────────
  private readonly _createVehicleUseCase = new CreateVehicleUseCase(this._vehicleRepository);
  private readonly _getMyVehiclesUseCase = new GetMyVehiclesUseCase(this._vehicleRepository);
  private readonly _getVehicleByIdUseCase = new GetVehicleByIdUseCase(this._vehicleRepository);
  private readonly _updateVehicleUseCase = new UpdateVehicleUseCase(this._vehicleRepository);
  private readonly _deleteVehicleUseCase = new DeleteVehicleUseCase(this._vehicleRepository);

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
    this._updatePersonalInfoUseCase,
  );

  readonly adminController = new AdminController(
    this._adminLoginUseCase,
    this._getAllUsersUseCase,
    this._toggleBlockUserUseCase,
    this._getAllRidersUseCase,
    this._updateRiderStatusUseCase,
    this._getUserDetailsUseCase,
    this._getAdminRidesUseCase,
    this._updateAdminRideStatusUseCase,
    this._deleteAdminRideUseCase,
  );

  readonly rideController = new RideController(
    this._createRideUseCase,
    this._getRidesUseCase,
    this._getMyRidesUseCase,
    this._getRideByIdUseCase,
    this._updateRideUseCase,
    this._cancelRideUseCase,
    this._deleteRideUseCase,
    this._searchRidesUseCase,
  );

  readonly vehicleController = new VehicleController(
    this._createVehicleUseCase,
    this._getMyVehiclesUseCase,
    this._getVehicleByIdUseCase,
    this._updateVehicleUseCase,
    this._deleteVehicleUseCase,
  );

  // Singleton accessor
  static getInstance(): AppContainer {
    if (!AppContainer._instance) {
      AppContainer._instance = new AppContainer();
    }
    return AppContainer._instance;
  }
}
