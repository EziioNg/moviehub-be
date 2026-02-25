import { MongoClient, ServerApiVersion } from "mongodb";
import { env } from "~/config/environment";

// khởi tạo đối tượng trelloDatabaseInstance ban đầu là null vì chưa kết nối
let trelloDatabaseInstance = null;

// khởi tạo đối tượng mongoClientInstance để kết nối tới mongodb
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Stable API: https://www.mongodb.com/docs/manual/reference/stable-api/
  autoSelectFamily: false,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// kết nối database
export const CONNECT_DB = async () => {
  // gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect();

  // nếu kết nối thành công, lấy database trello từ mongoClientInstance và gán cho trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME);
};

// đóng kết nối
export const CLOSE_DB = async () => {
  await mongoClientInstance.close();
};

// export trelloDatabaseInstance sau khi kết nối thành công để tái sử dụng kết nối ở nhiều nơi
export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    // throw error nếu chưa kết nối
    throw new Error("Database not connected yet.");
  }
  return trelloDatabaseInstance; // return trelloDatabaseInstance nếu có(đã kết nối)
};
