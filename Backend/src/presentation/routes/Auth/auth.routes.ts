/**
 * Auth Routes – Presentation Layer
 * Thin router: only wires HTTP verbs to controller methods.
 * All dependency creation is handled by AppContainer.
 */
import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser } from "../../middleware/AuthMiddleware";

const router = Router();
const { authController, tokenService } = AppContainer.getInstance();

router.post("/signup", authController.register);
router.post("/VerifyOtp", authController.VerifyOtp);
router.post("/resend-otp", authController.resendOtp);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.put("/reset-password", authController.resetPassword);
router.post("/google-login", authController.googleLogin);
router.post("/logout", authController.logout);
router.get("/me", authenticateUser(tokenService), authController.me);

export default router;
