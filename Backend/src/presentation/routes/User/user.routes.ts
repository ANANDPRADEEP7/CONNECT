/**
 * User Routes – Presentation Layer
 * Thin router: only wires HTTP verbs + middleware to controller methods.
 * All dependency creation is handled by AppContainer.
 *
 * NOTE: File uploads are handled client-side via Cloudinary.
 * The frontend sends Cloudinary secure_url strings in the JSON body.
 */
import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser } from "../../middleware/AuthMiddleware";

const router = Router();
const { userProfileController, tokenService } = AppContainer.getInstance();

// Protect all user routes
router.use(authenticateUser(tokenService));

router.get("/:userId", (req, res, next) => userProfileController.getUserDetails(req, res, next));

// No multer – body is plain JSON with Cloudinary URLs
router.post("/profile", (req, res, next) => userProfileController.updateProfile(req, res, next));

export default router;
