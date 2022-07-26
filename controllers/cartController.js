import Cart from "../models/Cart.js";
import Wishlist from "../models/WishList.js";


// Add to wishlist
export const addToWishlist = async (req, res, next) => {
    try {
        const {
            productName,
            quantity,
            productImage,
            productPrice,
            userId,
            productId,
            Stock,
        } = req.body;

        const wishList = await Wishlist.create({
            productName,
            quantity,
            productImage,
            productPrice,
            userId,
            productId,
            Stock,
        });

        return res.status(200).json({
            success: true,
            wishList,
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

//getWishlistData 
export const getWishlistData = async (req, res, next) => {
    try {
        const wishlistData = await Wishlist.find({ userId: req.user.id });

        return res.status(200).json({
            success: true,
            wishlistData
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

// remove wishlistData
export const removeWishlistData = async (req, res, next) => {
    try {
        const wishlistData = await Wishlist.findById(req.params.id);

        if (!wishlistData) {
            return res.status(404).json({
                success: false,
                message: "No wishlistData found with this id"
            });
        }

        await wishlistData.remove();

        return res.status(200).json({
            success: true,
            message: "Item removed from wishlist",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// add To Cart
export const addToCart = async (req, res, next) => {
    try {
        const {
            productName,
            quantity,
            productImage,
            productPrice,
            userId,
            productId,
            Stock,
        } = req.body;
        const cart = await Cart.create({
            productName,
            quantity,
            productImage,
            productPrice,
            userId,
            productId,
            Stock,
        });

        return res.status(200).json({
            success: true,
            cart,
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

// update Cart
export const updateCart = async (req, res) => {
    try {
        const {
            quantity,
        } = req.body;
        const cart = await Cart.findByIdAndUpdate(req.params.id);

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "No cart  found with this id"
            });
        }

        await cart.update({
            quantity,
        });

        return res.status(200).json({
            success: true,
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}


// get Cart Data
export const getCartData = async (req, res) => {
    try {
        const cartData = await Cart.find({ userId: req.user.id });

        return res.status(200).json({
            success: true,
            cartData,
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}


// remove Cart Data
export const removeCartData = async (req, res) => {
    try {
        const cartData = await Cart.findById(req.params.id);

        if (!cartData) {
            return res.status(404).json({
                success: false,
                message: "tems is not found with this id"
            });
        }

        await cartData.remove();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}