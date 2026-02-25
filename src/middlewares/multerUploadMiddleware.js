import { StatusCodes } from "http-status-codes";

import multer from "multer";

import ApiError from "~/utils/ApiError";
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE,
} from "~/utils/validators";

// function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, cb) => {
  // console.log('multerFile: ', file)

  // Kiểm tra kiểu file với multer thì dùng mimetype thay vì type
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const erMesage = "File type is invalid. Only accept jpg, jpeg and png";
    return cb(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, erMesage), null);
  }
  // Nếu như kiểu file hợp lệ
  return cb(null, true);
};

// Khởi tạo function upload được bọc bởi multer
// next() sẽ được tự động gọi bởi multer nếu File hợp lệ theo fileFilter và thỏa điều kiện limits
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter,
});

export const multerUploadMiddleware = {
  upload,
};
