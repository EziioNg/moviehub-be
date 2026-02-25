import express from "express";
import { seriesController } from "~/controllers/seriesController";

const Router = express.Router();

Router.route("/:id").get(seriesController.getSeriesById);

Router.route("/:id/movies").get(seriesController.getMoviesBySeriesId);

export const seriesRoute = Router;
