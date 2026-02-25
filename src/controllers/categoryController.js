import { StatusCodes } from "http-status-codes";

import { categoryService } from "~/services/categoryService";

const getCategories = async (req, res, next) => {
  try {
    const { categories } = req.query;
    const result = await categoryService.getCategories(categories);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const result = await categoryService.getCategoryById(categoryId);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getMoviesByCategoryId = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    // console.log('categoryId received: ', categoryId)
    const movies = await categoryService.getMoviesByCategoryId(categoryId);
    // console.log('movies received: ', movies)
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

export const categoryController = {
  getCategoryById,
  getCategories,
  getMoviesByCategoryId,
};
