/**
 * Ride Routes – Presentation Layer
 * All ride routes are protected (rider must be authenticated).
 */
import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser } from "../../middleware/AuthMiddleware";

const router = Router();
const { rideController, tokenService } = AppContainer.getInstance();

// All ride routes require authentication
router.use(authenticateUser(tokenService));

router.post("/",      (req, res, next) => rideController.createRide(req as any, res, next));  // POST  /ride
router.get("/",       (req, res, next) => rideController.getAllRides(req as any, res, next));  // GET   /ride
router.get("/my",     (req, res, next) => rideController.getMyRides(req as any, res, next));   // GET   /ride/my

export default router;
