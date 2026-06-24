import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser } from "../../middleware/AuthMiddleware";

const router = Router();
const { userProfileController, tokenService } = AppContainer.getInstance();

// Protect all user routes
router.use(authenticateUser(tokenService));

router.get("/:userId", (req, res, next) => userProfileController.getUserDetails(req, res, next));


router.post("/profile", (req, res, next) => userProfileController.updateProfile(req, res, next));


router.patch("/personal-info", (req, res, next) =>
  userProfileController.updatePersonalInfo(req, res, next),
);

export default router;
