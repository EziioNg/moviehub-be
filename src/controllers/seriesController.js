import { StatusCodes } from "http-status-codes";

import { seriesService } from "~/services/seriesService";

const getAllSeries = async (req, res, next) => {
  try {
    const { series } = req.query;
    const result = await seriesService.getAllSeries(series);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getSeriesById = async (req, res, next) => {
  try {
    const seriesId = req.params.id;
    const result = await seriesService.getSeriesById(seriesId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getMoviesBySeriesId = async (req, res, next) => {
  try {
    const seriesId = req.params.id;
    // console.log('seriesId received: ', seriesId)
    const movies = await seriesService.getMoviesBySeriesId(seriesId);
    // console.log('movies received: ', movies)
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

export const seriesController = {
  getAllSeries,
  getSeriesById,
  getMoviesBySeriesId,
};
