import Order from "../models/Order.js";
import Product from "../models/Product.js"


//create order
export const createOrder = async (req, res, next) => {
    try {
        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        const order =  await Order.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id,
        });

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

//  Get Single order
export const getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            "user",
            "name email"
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this id"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// Get all orders
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });

        if (!orders) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this id"
            });
        }

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message + "Order not found with this id"
        });
    }
}

// Get All orders ---Admin
export const getAdminAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();

        let totalAmount = 0;

        orders.forEach((order) => {
            totalAmount += order.totalPrice;
        });

        return res.status(200).json({
            success: true,
            totalAmount,
            orders
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

// update Order Status ---Admin
export const updateAdminOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this id"
            });
        }

        if (order.orderStatus === "Delivered") {
            return res.status(404).json({
                success: false,
                message: "You have already delivered this order"
            });
        }

        if (req.body.status === "Shipped") {
            order.orderItems.forEach(async (o) => {
                await updateStock(o.product, o.quantity);
            });
        }
        order.orderStatus = req.body.status;

        if (req.body.status === "Delivered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function updateStock(id, quantity) {

    const product = await Product.findById(id);

    product.Stock -= quantity;

    await product.save({ validateBeforeSave: false });
}

// delete Order ---Admin
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found with this id"
            });
        }

        await order.remove();

        return res.status(200).json({
            success: true,
        });
    }catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}