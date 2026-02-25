import { StatusCodes } from "http-status-codes";

import { DEFAULT_VALUE, DEFAULT_ITEMS_PER_PAGE } from "~/utils/constants";
import ApiError from "~/utils/ApiError";
import { movieModel } from "~/models/movieModel";
import { categoryModel } from "~/models/categoryModel";

const getMovies = async (movie, itemsPerPage) => {
  try {
    if (!movie) movie = DEFAULT_VALUE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

    const results = await movieModel.getMovies(
      parseInt(movie, 10),
      parseInt(itemsPerPage, 10),
    );
    //console.log('result: ', results)
    return results;
  } catch (error) {
    throw error;
  }
};

const getDetails = async (movieId) => {
  try {
    const movie = await movieModel.getDetails(movieId);
    if (!movie) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Movie not found");
    }
    //console.log('movie: ', movie)
    return movie;
  } catch (error) {
    throw error;
  }
};

const searchMovies = async (query) => {
  try {
    const results = await movieModel.searchMovies(query);
    return results;
  } catch (error) {
    throw error;
  }
};

const getCategoriesByMovieId = async (movieId) => {
  try {
    const movie = await movieModel.getDetails(movieId);
    if (!movie) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Movie not found.");
    }

    const categories = await categoryModel.getCategoriesByMovieId({
      _id: { $in: movie.categoryIds },
    });

    return categories;
  } catch (error) {
    throw error;
  }
};

export const movieService = {
  getMovies,
  getDetails,
  searchMovies,
  getCategoriesByMovieId,
};
