import express from "express";
import cors from "cors";
import exitHook from "async-exit-hook";
import cookieParser from "cookie-parser";

// import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from "./config/cors";
import { CONNECT_DB, CLOSE_DB } from "~/config/mongodb";
import { env } from "~/config/environment";
import { APIs_V1 } from "~/routes/v1";
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware";

const START_SERVER = () => {
  const app = express();

  // fix lỗi cache from disk của ExpressJs
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.use(cookieParser());

  app.use(cors(corsOptions)); // config cors bằng corsOptions

  app.get("/", (req, res) => {
    res.end("<h1>Hello World!</h1><hr>");
  });

  // enable express json data
  app.use(express.json());

  // use API v1
  app.use("/v1", APIs_V1);

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware);

  // môi trường production
  const PORT = process.env.PORT || 5000;
  if (env.BUILD_MODE === "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Production: Hello ${env.AUTHOR}, I am running at Port: ${PORT}`,
      );
    });
  } else {
    // môi trường local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `Local dev: Hello ${env.AUTHOR}, I am running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`,
      );
    });
  }

  // clean up trước khi dừng server:
  exitHook(() => {
    console.log("closing db connection");
    CLOSE_DB();
    console.log("db connection closed");
  });
};

// Immediatly invoked function expression(IIFE): khai báo function ẩn danh và chạy ngay sau khi khai báo
(async () => {
  try {
    console.log("Connecting...");
    await CONNECT_DB();
    console.log("Connection established");
    START_SERVER();
  } catch (error) {
    console.log("error: ", error);
    process.exit(0);
  }
})();
