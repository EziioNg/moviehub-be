import { StatusCodes } from "http-status-codes";

import bcryptjs from "bcryptjs";

import { v4 as uuidv4 } from "uuid";

import crypto from "crypto";

import { ObjectId } from "mongodb";

import { env } from "~/config/environment";

import fs from "fs";
import path from "path";

import { userModel } from "~/models/userModel";
import { movieModel } from "~/models/movieModel";

import { JwtProvider } from "~/providers/JwtProvider";
import { ResendProvider } from "~/providers/ResendProvider";
import { CloudinaryProvider } from "~/providers/CloudinaryProvider";

import ApiError from "~/utils/ApiError";
import { WEBSITE_DOMAINS } from "~/utils/constants";
import { pickUser } from "~/utils/formatters";

const createNew = async (reqBody) => {
  try {
    // kiểm tra xem email đã tồn tại chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "User already existed");
    }

    const nameFromEmail = reqBody.email.split("@")[0]; // lấy tên từ email (ví dụ abcdev@gmail.com => abcdev)

    // tạo đối tượnq user để lưu vào db
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      userName: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4(), // tạo token string random bằng uuid
    };
    const createdUser = await userModel.createNew(newUser);
    // console.log('User created from model: ', createdUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    // tạo nội dung của email
    const verificationLink = `${WEBSITE_DOMAINS}/auth/account-verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject = "Hello from MovieHub! Welcome!";

    const templatePath = path.join(
      process.cwd(),
      "emails/MovieHubVerifyEmail.html",
    );
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    htmlContent = htmlContent.replace("{VERIFICATION_LINK}", verificationLink);

    // gọi tới provider gửi email
    const to = getNewUser.email;
    const subject = customSubject;
    const html = htmlContent;
    // await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    await ResendProvider.sendEmail({ to, subject, html });

    // trả dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    throw error;
  }
};

const verifyAccount = async (reqBody) => {
  try {
    // Query tìm user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // các bước kiểm tra
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found");
    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Account already verified",
      );
    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid");

    // update lại thông tin user để verify nếu qua các bước kiểm tra
    const updateData = {
      isActive: true,
      verifyToken: null,
    };
    // gọi model để update user
    const updatedUser = await userModel.update(existUser._id, updateData);
    return pickUser(updatedUser); // trả về user cho controller sau khi verify
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  try {
    // Query tìm user trong database
    const existUser = await userModel.findOneByEmail(reqBody.email);

    // các bước kiểm tra
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found");
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Account not verified");
    // so sánh password từ request gửi lên và password trong database
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Wrong credentials");
    }

    /** tạo token đăng nhập và trả về cho FE nếu qua các bước kiểm tra */
    // tạo thông tin user để đính kèm trong JWT token
    const userInfo = {
      _id: existUser._id,
      email: existUser.email,
    };
    // tạo 2 loại token để trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_PRIVATE_KEY,
      // 5,
      env.ACCESS_TOKEN_LIFE,
    );
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_PRIVATE_KEY,
      env.REFRESH_TOKEN_LIFE,
    );
    // trả về thông tin user kèm 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(existUser) };
  } catch (error) {
    throw error;
  }
};

const refresh_token = async (clientRefreshToken) => {
  try {
    // Kiểm tra xem token có hợp lệ không
    const clientRefreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_PRIVATE_KEY,
    );
    // console.log("clientRefreshTokenDecoded: ", clientRefreshTokenDecoded);

    // tạo thông tin user để đính kèm trong JWT token
    const userInfo = {
      _id: clientRefreshTokenDecoded._id,
      email: clientRefreshTokenDecoded.email,
    };

    // tạo access token mới để trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_PRIVATE_KEY,
      // 5,
      env.ACCESS_TOKEN_LIFE,
    );
    // console.log("new accessToken created: ", accessToken);

    return { accessToken };
  } catch (error) {
    throw error;
  }
};

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId);
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found");
    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_FOUND, "Your Account is not verified");

    let updatedUser = {};
    // Update password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xem current_password có đúng không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Wrong credentials");
      }
      // Nếu qua kiểm tra thì hash password mới và update vào db
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8),
      });
    } else if (userAvatarFile) {
      // Upload file ảnh lên cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        "users",
      );
      // console.log('uploadResult: ', uploadResult)

      // Lấy url (secure_url) từ uploadResult lưu vào database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url,
      });
    } else {
      // Update các thông tin chung
      updatedUser = await userModel.update(existUser._id, reqBody);
    }
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    // Tìm user theo email
    const existUser = await userModel.findOneByEmail(email);
    if (!existUser) throw new Error("User not found");

    // Tạo token reset (raw token sẽ gửi qua email)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token trước khi lưu vào DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = Date.now() + 3600000; // 1 giờ

    // Lưu token + thời hạn vào DB
    await userModel.updateResetPasswordToken(
      existUser._id,
      hashedToken,
      expiresAt,
    );

    // Link reset gửi qua email chứa **raw token chưa hash**
    const resetUrl = `${WEBSITE_DOMAINS}/auth/reset-password?email=${existUser.email}&token=${resetToken}`;
    const customSubject = "Hello from MovieHub! Forgot your Password?";

    const templatePath = path.join(
      process.cwd(),
      "emails/MovieHubForgotPassword.html",
    );
    let htmlContent = fs.readFileSync(templatePath, "utf8");
    htmlContent = htmlContent.replace("{VERIFICATION_LINK}", resetUrl);
    // gọi tới provider gửi email
    const to = existUser.email;
    const subject = customSubject;
    const html = htmlContent;

    await ResendProvider.sendEmail({ to, subject, html });
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    // Hash token từ URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Tìm user theo token + chưa hết hạn
    const user = await userModel.findOneByToken(hashedToken);
    if (!user) throw new Error("Invalid or expired reset token");

    // Hash mật khẩu mới
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Cập nhật password và xóa token trực tiếp
    await userModel.updatePasswordAndClearToken(user._id, hashedPassword);

    return { success: true, message: "Password reset successful." };
  } catch (error) {
    throw error;
  }
};

export const addFavorite = async (userId, movieId) => {
  // console.log('userId from controller: ', userId)
  // console.log('movieId from controller: ', movieId)

  if (!ObjectId.isValid(userId)) throw new Error(`Invalid userId: ${userId}`);
  if (!ObjectId.isValid(movieId))
    throw new Error(`Invalid movieId: ${movieId}`);

  const existUser = await userModel.findOneById(userId);
  // console.log('user found: ', existUser)
  if (!existUser) throw new Error("User not found");

  // check movie tồn tại
  const movie = await movieModel.getDetails(movieId);
  if (!movie) throw new Error("Movie not found");

  if (existUser.favoriteMovieIds.some((id) => id.equals(movie._id))) {
    return { status: "duplicate", user: existUser };
  }

  const result = await userModel.update2(
    existUser._id,
    { $addToSet: { favoriteMovieIds: new ObjectId(movieId) } }, // dùng ObjectId
  );

  if (!result) throw new Error("Error adding favorite");
  return result;
};

export const removeFavorite = async (userId, movieId) => {
  if (!ObjectId.isValid(userId)) throw new Error(`Invalid userId: ${userId}`);
  if (!ObjectId.isValid(movieId))
    throw new Error(`Invalid movieId: ${movieId}`);

  const existUser = await userModel.findOneById(userId);
  if (!existUser) throw new Error("User not found");

  if (!ObjectId.isValid(movieId)) {
    throw new Error(`Invalid movieId: ${movieId}`);
  }

  if (
    !existUser.favoriteMovieIds.some((id) => id.equals(new ObjectId(movieId)))
  ) {
    return { status: "not_found", user: existUser };
  }

  const result = await userModel.update2(userId, {
    $pull: { favoriteMovieIds: new ObjectId(movieId) },
  });

  if (!result) throw new Error("Error deleting favorite");
  // console.log('result after deleting: ', result)
  return result;
};

export const getFavorites = async (userId) => {
  const user = await userModel.findOneById(userId);
  if (!user) throw new Error("User not found");

  // lấy chi tiết phim theo danh sách id
  const favorites = await movieModel.getManyByIds(user.favoriteMovieIds || []);
  // console.log('favorites received from model: ', favorites)
  return favorites;
};

export const userService = {
  createNew,
  verifyAccount,
  login,
  update,
  refresh_token,
  addFavorite,
  removeFavorite,
  getFavorites,
  forgotPassword,
  resetPassword,
};
