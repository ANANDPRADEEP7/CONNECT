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

// Update personal info (name, email, phone) – does NOT affect rider status
router.patch("/personal-info", (req, res, next) =>
  userProfileController.updatePersonalInfo(req, res, next),
);

export default router;
