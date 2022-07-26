import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(404).json({
      success: false,
      message: "You are not authenticated!"
    });
  }

  //const decodedData = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  /*await jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
        return res.status(404).json({
            success: false,
            message: "Token is not valid!"
        });
    }
    req.user = user;
    next()

//     req.user = await User.findById(decodedData.id);

//   next();
  });*/

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decodedData.id);

  next();
};

// Admin Roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(404).json({
        success: false,
        message: `${req.user.role} can not access this resources`
      });
    };
    next();
  }
}