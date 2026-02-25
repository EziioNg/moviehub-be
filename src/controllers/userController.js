import { StatusCodes } from "http-status-codes";

import ms from "ms";

import { userService } from "~/services/userService";
import { pickUser } from "~/utils/formatters";

const createNew = async (req, res, next) => {
  try {
    // console.log('req received from request: ', req.body)
    // điều hướng dữ liệu sang tầng service
    const createdUser = await userService.createNew(req.body);
    // console.log('user created from service: ', createdUser)

    // trả kết quả về cho client
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);

    // Tạo 2 cookie chứa 2 token và trả về cho FE
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });

    res.status(StatusCodes.OK).json(result);
    // console.log('user received after login: ', result)
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Xóa 2 cookie
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(StatusCodes.OK).json({ loggedOut: true });
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req, res, next) => {
  try {
    const result = await userService.refresh_token(req.cookies?.refreshToken);
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: ms("14 days"),
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    // console.error('Refresh Token Verification Error:', error)
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id; // lấy id của user thông qua jwtDecoded đã khai báo trong authMiddleware
    const userAvatarFile = req.file;
    // console.log('avatar from request: ', userAvatarFile)
    const updatedUser = await userService.update(
      userId,
      req.body,
      userAvatarFile,
    );
    res.status(StatusCodes.OK).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { movieId } = req.body;

    const result = await userService.addFavorite(userId, movieId);

    if (result.status === "duplicate") {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Movie already in favorites",
        user: result.user,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Movie added to favorites successfully",
      user: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { movieId } = req.body;
    // console.log("userId: ", userId);
    // console.log("movieId: ", movieId);

    const result = await userService.removeFavorite(userId, movieId);

    if (result.status === "not_found") {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Movie not found in favorites",
        user: result.user,
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Movie removed from favorites successfully",
      user: result,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách favorites (populate thông tin movie luôn)
export const getFavorites = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const favorites = await userService.getFavorites(userId);
    // console.log('favorites received from service: ', favorites)
    res.status(StatusCodes.OK).json(favorites);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // console.log("email recieved from request: ", email);
    const result = await userService.forgotPassword(email);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await userService.resetPassword(token, newPassword);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // User info is already decoded in authMiddleware as req.jwtDecoded
    const currentUser = req.jwtDecoded;

    if (!currentUser) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "User not found" });
    }

    res.status(StatusCodes.OK).json(pickUser(currentUser));
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  update,
  refresh_token,
  addFavorite,
  removeFavorite,
  getFavorites,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
