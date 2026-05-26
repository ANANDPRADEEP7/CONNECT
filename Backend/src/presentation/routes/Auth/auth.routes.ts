import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser, AuthRequest } from "../../middleware/AuthMiddleware";
import { AUTH_ROUTES } from "../routes.constants";

const router = Router();
// depinc
const { authController, tokenService } = AppContainer.getInstance();

router.post(AUTH_ROUTES.SIGNUP, (req, res, next) => authController.register(req, res, next));
router.post(AUTH_ROUTES.VERIFY_OTP, (req, res, next) => authController.VerifyOtp(req, res, next));
router.post(AUTH_ROUTES.RESEND_OTP, (req, res, next) => authController.resendOtp(req, res, next));
router.post(AUTH_ROUTES.LOGIN, (req, res, next) => authController.login(req, res, next));
router.post(AUTH_ROUTES.REFRESH, (req, res, next) => authController.refresh(req, res, next));
router.post(AUTH_ROUTES.VERIFY_EMAIL, (req, res, next) =>
  authController.verifyEmail(req, res, next),
);
router.put(AUTH_ROUTES.RESET_PASSWORD, (req, res, next) =>
  authController.resetPassword(req, res, next),
);
router.post(AUTH_ROUTES.GOOGLE_LOGIN, (req, res, next) =>
  authController.googleLogin(req, res, next),
);
router.post(AUTH_ROUTES.LOGOUT, (req, res, next) => authController.logout(req, res, next));
router.get(AUTH_ROUTES.ME, authenticateUser(tokenService), (req: AuthRequest, res, next) =>
  authController.me(req, res, next),
);

export default router;
