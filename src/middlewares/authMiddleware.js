import { StatusCodes } from "http-status-codes";

import { JwtProvider } from "~/providers/JwtProvider";
import { env } from "~/config/environment";
import ApiError from "~/utils/ApiError";

// Middleware xác thực JWT accessToken nhận từ FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken trong cookie từ request phía client gửi lên
  // console.log('accessToken: ', req.cookies?.accessToken)
  const clientAccessToken = req.cookies?.accessToken;

  // Nếu như clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Token not found"));
    return;
  }
  // console.log('clientAccessToken: ', clientAccessToken)

  try {
    // Kiểm tra xem token có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_PRIVATE_KEY,
    );
    // console.log('accessTokenDecoded: ', accessTokenDecoded)

    // Nếu token hợp lệ thì lưu thông tin giải mã (json object) vào req.jwtDecoded để dùng trong các tầng sau
    req.jwtDecoded = accessTokenDecoded; // tạo prop jwtDecoded và gán json object thông tin giải mã

    // cho phép request đi tiếp
    next();
  } catch (error) {
    // console.log('auth error: ', error.message)

    // Nếu token hết hạn
    if (error?.message?.includes("jwt expired")) {
      next(
        new ApiError(StatusCodes.UNAUTHORIZED, "Token need to be refreshed"),
      );
      return;
    }

    // Nếu token không hợp lệ
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
  }
};
export const authMiddleware = {
  isAuthorized,
};
