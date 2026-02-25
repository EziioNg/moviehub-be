import { seriesModel } from "~/models/seriesModel";
import { DEFAULT_VALUE } from "~/utils/constants";
import { StatusCodes } from "http-status-codes";
import { movieModel } from "~/models/movieModel";
import ApiError from "~/utils/ApiError";

const getSeriesById = async (seriesId) => {
  try {
    const results = await seriesModel.getSeriesById(seriesId);
    //console.log('result: ', results)
    return results;
  } catch (error) {
    throw error;
  }
};

const getCategories = async (categories) => {
  try {
    if (!categories) categories = DEFAULT_VALUE;

    const results = await seriesModel.getAllSeries(parseInt(categories, 10));
    //console.log('result: ', results)
    return results;
  } catch (error) {
    throw error;
  }
};

const getMoviesBySeriesId = async (seriesId) => {
  try {
    const series = await seriesModel.getSeriesById(seriesId);
    if (!series) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Current series not found.");
    }

    const movies = await movieModel.getMoviesBySeriesId({
      _id: { $in: series.movieIds },
    });

    return movies;
  } catch (error) {
    throw error;
  }
};

export const seriesService = {
  getSeriesById,
  getCategories,
  getMoviesBySeriesId,
};
