import express from "express";
import { chatController2 } from "~/controllers/chatController2";

const Router = express.Router();

Router.route("/").post(chatController2.sendMessage);

export const chatRoute = Router;
