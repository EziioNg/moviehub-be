import express from "express";

import { userValidation } from "~/validations/userValidation";
import { userController } from "~/controllers/userController";
import { authMiddleware } from "~/middlewares/authMiddleware";
import { multerUploadMiddleware } from "~/middlewares/multerUploadMiddleware";

const Router = express.Router();

Router.route("/register").post(
  userValidation.createNew,
  userController.createNew,
);

Router.route("/verify").put(
  userValidation.verifyAccount,
  userController.verifyAccount,
);

Router.route("/login").post(userValidation.login, userController.login);

Router.route("/logout").delete(userController.logout);

Router.route("/forgot-password").post(userController.forgotPassword);

Router.route("/reset-password").put(userController.resetPassword);

Router.route("/refresh_token").put(userController.refresh_token);

Router.route("/update").put(
  authMiddleware.isAuthorized,
  // dùng upload từ middleware multerUploadMiddleware kiểm tra file có key avatar đẩy lên từ FE
  multerUploadMiddleware.upload.single("avatar"),
  userValidation.update,
  userController.update,
);

Router.route("/:userId/favorites").post(
  authMiddleware.isAuthorized,
  userController.addFavorite,
);

Router.route("/:userId/favorites").delete(
  authMiddleware.isAuthorized,
  userController.removeFavorite,
);

Router.route("/:userId/favorites").get(
  authMiddleware.isAuthorized,
  userController.getFavorites,
);

Router.route("/me").get(
  authMiddleware.isAuthorized, // Protect this endpoint
  userController.getCurrentUser,
);

export const userRoute = Router;
