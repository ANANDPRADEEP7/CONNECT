import { Router } from "express";
import { AppContainer } from "../../../infrastructure/DI/AppContainer";
import { authenticateUser, AuthRequest } from "../../middleware/AuthMiddleware";

const router = Router();
const { vehicleController, tokenService } = AppContainer.getInstance();

// All vehicle routes require authentication
router.use(authenticateUser(tokenService));

router.post("/", (req: AuthRequest, res, next) =>
  vehicleController.createVehicle(req, res, next),
); // POST /vehicle
router.get("/my", (req: AuthRequest, res, next) =>
  vehicleController.getMyVehicles(req, res, next),
); // GET /vehicle/my
router.get("/:id", (req: AuthRequest, res, next) =>
  vehicleController.getVehicleById(req, res, next),
); // GET /vehicle/:id
router.patch("/:id", (req: AuthRequest, res, next) =>
  vehicleController.updateVehicle(req, res, next),
); // PATCH /vehicle/:id
router.delete("/:id", (req: AuthRequest, res, next) =>
  vehicleController.deleteVehicle(req, res, next),
); // DELETE /vehicle/:id

export default router;
