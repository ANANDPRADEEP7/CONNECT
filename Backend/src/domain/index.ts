/**
 * Domain barrel export
 * Import domain contracts from this single entry point:
 *   import { IUserRepository } from "@domain";
 */

// Entities
export * from "./entities/User/user.entities";
export * from "./entities/User/Otp.entities";

// Interfaces (service contracts)
export * from "./interfaces/ICacheService";
export * from "./interfaces/IEmailService";
export * from "./interfaces/ILogger";
export * from "./interfaces/ITokenService";

// Enums
export * from "./enums/UserRole.enum";

// DTOs
export * from "./dtos/User/RegisterUserDTO";
export * from "./dtos/User/LoginUserDTO";

// Types
export * from "./types/index";
