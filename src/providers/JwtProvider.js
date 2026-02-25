import JWT from "jsonwebtoken";

// Function tạo token
const generateToken = async (userInfo, privateKey, tokenLife) => {
  try {
    return JWT.sign(
      userInfo, // thông tin user
      privateKey, // key bí mật
      { algorithm: "HS256", expiresIn: tokenLife }, // tokenLife: thời gian sống của token
    );
  } catch (error) {
    throw new Error(error);
  }
};

// Function kiểm tra token có hợp lệ không
const verifyToken = async (token, privateKey) => {
  try {
    // Hàm verify của thư viện JWT
    return JWT.verify(token, privateKey);
  } catch (error) {
    throw new Error(error);
  }
};

export const JwtProvider = {
  generateToken,
  verifyToken,
};
