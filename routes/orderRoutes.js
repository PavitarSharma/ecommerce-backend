import express from "express";
import {
    createOrder,
    getSingleOrder,
    getAllOrders,
    getAdminAllOrders,
    updateAdminOrder,
    deleteOrder
} from "../controllers/orderController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.post("/order/new", isAuthenticatedUser, createOrder);

router.get("/order/:id", isAuthenticatedUser,  getSingleOrder);

router.get("/orders/me", isAuthenticatedUser, getAllOrders);

router.get("/admin/orders", isAuthenticatedUser, authorizeRoles("admin"), getAdminAllOrders);

router.put("/admin/order/:id", isAuthenticatedUser, authorizeRoles("admin"), updateAdminOrder);

router.delete("/admin/order/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);


export default router;