/**
 * Admin Routes – Presentation Layer
 * Thin router: only wires HTTP verbs + middleware to controller methods.
 * All dependency creation is handled by AppContainer.
 */
import { Router } from "express";
import { AppContainer }      from "../../../infrastructure/DI/AppContainer";
import { authenticateAdmin } from "../../middleware/AuthMiddleware";

const router  = Router();
const { adminController, tokenService } = AppContainer.getInstance();

// Public admin routes
router.post("/login",  adminController.login);
router.post("/logout", adminController.logout);

// Protected admin routes
router.use(authenticateAdmin(tokenService));
router.get(   "/me",                 adminController.me);
router.get(   "/users",              adminController.getAllUsers);
router.get(   "/riders",             adminController.getAllRiders);
router.patch( "/users/:id/block",    adminController.toggleBlockUser);
router.patch( "/riders/:id/status",  adminController.updateRiderStatus);

export default router;
