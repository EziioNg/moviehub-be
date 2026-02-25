import Joi from "joi";
import { ObjectId } from "mongodb";

import { GET_DB } from "~/config/mongodb";
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE,
} from "~/utils/validators";

// define tạm 2 role:
const USER_ROLES = {
  CLIENT: "client",
  ADMIN: "admin",
};

// Define Collection (name & schema)
const USER_COLLECTION_NAME = "users";
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .pattern(EMAIL_RULE)
    .message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required(),

  userName: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  gender: Joi.string().trim().strict().default("male"),
  avatar: Joi.string().default(null),
  favoriteMovieIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  role: Joi.string()
    .valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT)
    .default(USER_ROLES.CLIENT),
  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

// chỉ định các field không được phép update
const INVALID_UPDATE_FIELDS = ["_id", "email", "username", "createdAt"];

// hàm validate dữ liệu trước khi tạo mới một User
const validateBeforeCreating = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

// hàm tạo mới một User
const createNew = async (data) => {
  try {
    // validate dữ liệu bằng hàm validateBeforeCreating và gán cho validatedData
    const validatedData = await validateBeforeCreating(data);
    // console.log('validatedData: ', validatedData)

    // truyền validatedData cho insertOne để thêm User vừa tạo vào database sau khi validate xong
    const newUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(validatedData);
    // console.log('newUser: ', newUser)
    return newUser; // trả về cho service sau khi lưu bản ghi vào db bằng insertOne
  } catch (error) {
    console.error("error creating user: ", error);
    throw error; // ném lại error gốc
  }
};

const findOneById = async (userId) => {
  try {
    // console.log(new ObjectId(id))
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(userId) });
    return result;
  } catch (error) {
    throw new Error("Error: ", error);
  }
};

const findOneByEmail = async (emailValue) => {
  try {
    // console.log(new ObjectId(id))
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email: emailValue });
    return result;
  } catch (error) {
    throw new Error("Error: ", error);
  }
};

const findOneByToken = async (hashedToken) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
    return result;
  } catch (error) {
    throw new Error("Error finding user by token: " + error);
  }
};

const updateResetPasswordToken = async (userId, hashedToken, expiresAt) => {
  try {
    await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: expiresAt,
          },
        },
      );
  } catch (error) {
    throw new Error("Error updating reset token: " + error);
  }
};

const updatePasswordAndClearToken = async (userId, hashedPassword) => {
  try {
    await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: { password: hashedPassword },
          $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
        },
      );
  } catch (error) {
    throw new Error("Error: " + error);
  }
};

const update = async (userId, updateData) => {
  try {
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData }, // gán dữ liệu cập nhật theo userId
        // updateData,
        { returnDocument: "after" }, // trả về bản ghi document sau khi cập nhật
      );
    return result;
  } catch (error) {
    throw new Error("Error updating user: ", error);
  }
};

const update2 = async (userId, updateData) => {
  try {
    const hasOperator = Object.keys(updateData).some((key) =>
      key.startsWith("$"),
    );
    const finalUpdate = hasOperator ? updateData : { $set: updateData };

    const filterId = userId instanceof ObjectId ? userId : new ObjectId(userId);

    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: filterId },
        finalUpdate,
        { returnDocument: "after" }, // driver v4+
      );
    // console.log('removeFavorite debug:', {
    //   filterId: filterId.toString(),
    //   updateData: finalUpdate,
    //   result
    // })

    // nếu driver v3: result chính là document
    // nếu driver v4: result.value mới là document
    return result.value || result;
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  findOneByToken,
  update,
  update2,
  updateResetPasswordToken,
  updatePasswordAndClearToken,
};
