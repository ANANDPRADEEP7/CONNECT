/**
 * Admin Routes – Presentation Layer
 * Thin router: only wires HTTP verbs + middleware to controller methods.
 * All dependency creation is handled by AppContainer.
 */
import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateAdmin } from "../../middleware/AuthMiddleware";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();
const { adminController, tokenService } = AppContainer.getInstance();

// Public admin routes
router.post("/login", catchAsync(adminController.login));
router.post("/logout", catchAsync(adminController.logout));

// Protected admin routes
router.use(authenticateAdmin(tokenService));
router.get("/me", catchAsync(adminController.me));
router.get("/users", catchAsync(adminController.getAllUsers));
router.get("/riders", catchAsync(adminController.getAllRiders));
router.patch("/users/:id/block", catchAsync(adminController.toggleBlockUser));
router.patch("/riders/:id/status", catchAsync(adminController.updateRiderStatus));

export default router;
