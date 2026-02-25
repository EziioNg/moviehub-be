import Joi from "joi";
import { StatusCodes } from "http-status-codes";

import ApiError from "~/utils/ApiError";
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  EMAIL_RULE_MESSAGE,
  PASSWORD_RULE_MESSAGE,
} from "~/utils/validators";

const createNew = async (req, res, next) => {
  // điều kiện validate dữ liệu
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE),
  });

  try {
    // validate dữ liệu
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // console.log('req received from validate: ', req.body)
    // abortEarly: false khi có nhiều lỗi validation thì trả về tất cả lỗi
    next(); // validate data xong thì chuyển đến controller
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    );
    next(customError);
  }
};

const verifyAccount = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    token: Joi.string().required(),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    );
    next(customError);
  }
};

const login = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .pattern(EMAIL_RULE)
      .message(EMAIL_RULE_MESSAGE),
    password: Joi.string()
      .required()
      .pattern(PASSWORD_RULE)
      .message(PASSWORD_RULE_MESSAGE),
  });

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    );
    next(customError);
  }
};

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    displayName: Joi.string().trim().strict(),
    current_password: Joi.string()
      .pattern(PASSWORD_RULE)
      .message(`current password: ${PASSWORD_RULE_MESSAGE}`),
    new_password: Joi.string()
      .pattern(PASSWORD_RULE)
      .message(`new password: ${PASSWORD_RULE_MESSAGE}`),
  });

  try {
    // cho phép unknown để không cần đẩy một số field lên
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage,
    );
    next(customError);
  }
};

export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update,
};
