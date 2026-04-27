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

router.post("/",      rideController.createRide);  // POST  /ride
router.get("/",       rideController.getAllRides);  // GET   /ride
router.get("/my",     rideController.getMyRides);   // GET   /ride/my

export default router;
