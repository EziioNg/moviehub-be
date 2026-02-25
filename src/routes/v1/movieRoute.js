import express from "express";
import { movieController } from "~/controllers/movieController";

const Router = express.Router();

// Get movies
Router.route("/").get(movieController.getMovies);

// Search movie
Router.route("/search").get(movieController.searchMovies);

// Get movie details
Router.route("/:id").get(movieController.getDetails);

Router.route("/:id/categories").get(movieController.getCategoriesByMovieId);

export const movieRoute = Router;
