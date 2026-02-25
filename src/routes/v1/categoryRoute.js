import express from "express";
import { categoryController } from "~/controllers/categoryController";

const Router = express.Router();

Router.route("/").get(categoryController.getCategories);

Router.route("/:id").get(categoryController.getCategoryById);

Router.route("/:id/movies").get(categoryController.getMoviesByCategoryId);

export const categoryRoute = Router;
