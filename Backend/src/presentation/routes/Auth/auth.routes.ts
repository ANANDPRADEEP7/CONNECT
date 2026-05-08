
import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser } from "../../middleware/AuthMiddleware";

const router = Router();
// depinc
const { authController, tokenService } = AppContainer.getInstance();

router.post("/signup", (req, res, next) => authController.register(req, res, next));
router.post("/VerifyOtp", (req, res, next) => authController.VerifyOtp(req, res, next));
router.post("/resend-otp", (req, res, next) => authController.resendOtp(req, res, next));
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/verify-email", (req, res, next) => authController.verifyEmail(req, res, next));
router.put("/reset-password", (req, res, next) => authController.resetPassword(req, res, next));
router.post("/google-login", (req, res, next) => authController.googleLogin(req, res, next));
router.post("/logout", (req, res, next) => authController.logout(req, res, next));
router.get("/me", authenticateUser(tokenService), (req, res, next) => authController.me(req as any, res, next));

export default router;
