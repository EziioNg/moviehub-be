// routes/mailRoutes.js
import express from "express";
import { mailController } from "~/controllers/mailController";

const Router = express.Router();

Router.route("/send").post(mailController.sendMailController);

export const sendRoute = Router;
