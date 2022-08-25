import Product from "../models/Product.js";
import Features from "../utils/Features.js";
import cloudinary from "cloudinary";

// Create A New Product
export const createProduct = async (req, res, next) => {
    try {

        let images = [];

        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
        req.body.user = req.user.id;

        const product = await new Product(req.body);

        await product.save();
        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
}

// Get All Product (Admin)
export const getAdminProducts = async (req, res, next) => {
    try {
        const products = await Product.find();

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}


// Get All products
export const getAllProducts = async (req, res, next) => {
    try {
        const resultPerPage = 8;

        const productsCount = await Product.countDocuments();
        const feature = new Features(Product.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);
        const products = await feature.query;



        return res.status(200).json({
            success: true,
            products,
            productsCount,
            resultPerPage,
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        })
    }
}


// Update Product - Admin
export const updateProduct = async (req, res, next) => {
    try {

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found with this id..."
            })
        }

        let images = [];

        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }

        if (images !== undefined) {
            // Delete image from cloudinary
            for (let i = 0; i < product.images.length; i++) {
                await cloudinary.v2.uploader.destroy(product.images[i].public_id);
            }

            const imagesLinks = [];

            for (let i = 0; i < images.length; i++) {
                const result = await cloudinary.v2.uploader.upload(images[i], {
                    folder: "products",
                });
                imagesLinks.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                });
            }
            req.body.images = imagesLinks;
        }


        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useUnified: false,
        });

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Delete Products
export const deleteProduct = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found with this id..."
            })
        }

        // Deleting images from cloudinary
        for (let i = 0; 1 < product.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(
                product.images[i].public_id
            );
        }

        await product.remove();

        return res.status(200).json({
            success: true,
            message: "Product deleted succesfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Single Product Details
export const getSingleProduct = async (req, res, next) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found with this id..."
            })
        }


        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Create New Review or Update the review
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
        };

        const product = await Product.findById(productId);

        const isReviewed = product.reviews.find(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString())
                    (rev.rating = rating), (rev.comment = comment);
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        return res.status(200).json({
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

// Get All reviews of a single product
export const getSingleProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.query.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found with this id..."
            })
        }

        return res.status(200).json({
            success: true,
            reviews: product.reviews,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// Delete Review --Admin
export const deleteReview = async (req, res) => {
    try {
        const product = await Product.findById(req.query.productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found with this id..."
            })
        }

        const reviews = product.reviews.filter(
            (rev) => rev._id.toString() !== req.query.id.toString()
        );

        let avg = 0;

        reviews.forEach((rev) => {
            avg += rev.rating;
        });

        let ratings = 0;

        if (reviews.length === 0) {
            ratings = 0;
        } else {
            ratings = avg / reviews.length;
        }

        const numOfReviews = reviews.length;

        await Product.findByIdAndUpdate(
            req.query.productId,
            {
                reviews,
                ratings,
                numOfReviews,
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        return res.status(200).json({
            success: true,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}