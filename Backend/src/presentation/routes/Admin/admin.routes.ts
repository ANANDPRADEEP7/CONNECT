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
router.post("/login",  (req, res, next) => adminController.login(req, res, next));
router.post("/logout", (req, res, next) => adminController.logout(req, res, next));

// Protected admin routes
router.use(authenticateAdmin(tokenService));
router.get(   "/me",                 (req, res, next) => adminController.me(req as any, res, next));
router.get(   "/users",              (req, res, next) => adminController.getAllUsers(req, res, next));
router.get(   "/riders",             (req, res, next) => adminController.getAllRiders(req, res, next));
router.patch( "/users/:id/block",    (req, res, next) => adminController.toggleBlockUser(req, res, next));
router.patch( "/riders/:id/status",  (req, res, next) => adminController.updateRiderStatus(req, res, next));

export default router;
