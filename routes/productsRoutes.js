import express from "express";
import {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getSingleProduct,
    createProductReview,
    getSingleProductReviews,
    deleteReview,
    getAdminProducts
} from "../controllers/productController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.get("/products", getAllProducts);

router.get("/admin/products", isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router.post("/products/new", isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.put("/products/:id",isAuthenticatedUser, authorizeRoles("admin"), updateProduct);

router.delete("/products/:id",isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.get("/products/:id", getSingleProduct);

router.post("/product/review", isAuthenticatedUser, createProductReview);

router
  .route("/reviews")
  .get(getSingleProductReviews)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);


export default router