import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateAdmin } from "../../middleware/AuthMiddleware";
import { catchAsync } from "../../utils/catchAsync";
import { ADMIN_ROUTES } from "../routes.constants";

const router = Router();
const { adminController, tokenService } = AppContainer.getInstance();

// Public admin routes
router.post(ADMIN_ROUTES.LOGIN, catchAsync(adminController.login));
router.post(ADMIN_ROUTES.LOGOUT, catchAsync(adminController.logout));

// Protected admin routes
router.use(authenticateAdmin(tokenService));
router.get(ADMIN_ROUTES.ME, catchAsync(adminController.me));
router.get(ADMIN_ROUTES.USERS, catchAsync(adminController.getAllUsers));
router.get(ADMIN_ROUTES.RIDERS, catchAsync(adminController.getAllRiders));
router.patch(ADMIN_ROUTES.TOGGLE_BLOCK_USER, catchAsync(adminController.toggleBlockUser));
router.patch(ADMIN_ROUTES.UPDATE_RIDER_STATUS, catchAsync(adminController.updateRiderStatus));

export default router;
