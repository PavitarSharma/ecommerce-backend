import express from "express";
import {
    signUp,
    signIn,
    logout,
    forgotPassword,
    resetPassword,
    userDetails,
    updatePassword,
    updateProfile,
    getAllUsers,
    getSingleUser,
    updateUserRole,
    deleteUser
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.post("/registeration", signUp)

router.post("/login", signIn);

router.get("/logout", logout);

router.post("/password/forgot", forgotPassword);

router.put("/password/reset/:token", resetPassword);

router.get("/me", isAuthenticatedUser, userDetails);

router.put("/me/updatePassword", isAuthenticatedUser, updatePassword)

router.put("/me/updateUser/info", isAuthenticatedUser, updateProfile);

// admin

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

router
    .route("/admin/user/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);


export default router