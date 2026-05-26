import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser, AuthRequest } from "../../middleware/AuthMiddleware";
import { RIDE_ROUTES } from "../routes.constants";

const router = Router();
const { rideController, tokenService } = AppContainer.getInstance();

// All ride routes require authentication
router.use(authenticateUser(tokenService));

router.post(RIDE_ROUTES.ROOT, (req: AuthRequest, res, next) =>
  rideController.createRide(req, res, next),
); // POST  /ride
router.get(RIDE_ROUTES.ROOT, (req, res, next) => rideController.getAllRides(req, res, next)); // GET   /ride
router.get(RIDE_ROUTES.MY_RIDES, (req: AuthRequest, res, next) =>
  rideController.getMyRides(req, res, next),
); // GET   /ride/my

export default router;
