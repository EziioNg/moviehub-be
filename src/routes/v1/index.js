import express from "express";
import { StatusCodes } from "http-status-codes";
import { movieRoute } from "./movieRoute";
import { categoryRoute } from "~/routes/v1/categoryRoute";
import { seriesRoute } from "~/routes/v1/seriesRoute";
import { userRoute } from "~/routes/v1/userRoute";
import { chatRoute } from "~/routes/v1/chatRoute";
import { sendRoute } from "~/routes/v1/sendRoute";

const Router = express.Router();

Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({
    status: "v1",
    message: "API is running",
    code: StatusCodes.OK,
  });
});

// APIs
Router.use("/movies", movieRoute);

Router.use("/category", categoryRoute);

Router.use("/series", seriesRoute);

Router.use("/users", userRoute);

Router.use("/chatbox", chatRoute);

Router.use("/sendmail", sendRoute);

export const APIs_V1 = Router;
