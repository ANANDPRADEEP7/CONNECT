/**
 * User Routes – Presentation Layer
 * Thin router: only wires HTTP verbs + middleware to controller methods.
 * All dependency creation is handled by AppContainer.
 */
import { Router } from "express";
import { AppContainer }         from "../../../infrastructure/DI/AppContainer";
import { authenticateUser }     from "../../middleware/AuthMiddleware";
import { uploadProfileDocs }    from "../../utils/multerConfig";

const router  = Router();
const { userProfileController, tokenService } = AppContainer.getInstance();

// Protect all user routes
router.use(authenticateUser(tokenService));

router.get("/:userId", (req, res, next) => userProfileController.getUserDetails(req, res, next));

router.post(
  "/profile",
  uploadProfileDocs.fields([
    { name: "govId",        maxCount: 1 },
    { name: "vehicleImage", maxCount: 1 },
    { name: "pucImage",     maxCount: 1 },
    { name: "rcImage",      maxCount: 1 },
  ]),
  (req, res, next) => userProfileController.updateProfile(req as any, res, next),
);

export default router;
