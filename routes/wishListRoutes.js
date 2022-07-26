import express from "express";
import {
    addToWishlist,
    getWishlistData,
    removeWishlistData,
    addToCart,
    getCartData,
    updateCart,
    removeCartData
} from "../controllers/cartController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.get("/wishlist", isAuthenticatedUser, getWishlistData);

router.post("/addToWishlist", isAuthenticatedUser, addToWishlist);

router.delete("/removeWishlist/:id", isAuthenticatedUser, removeWishlistData);

router.post("/addToCart", isAuthenticatedUser, addToCart);

router.get("/cart", isAuthenticatedUser, getCartData);

router.post("/cart/update/:id", isAuthenticatedUser, updateCart);

router.delete("/removeCart/:id", isAuthenticatedUser, removeCartData);


export default router;