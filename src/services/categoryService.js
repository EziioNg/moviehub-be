import { categoryModel } from "~/models/categoryModel";
import { DEFAULT_VALUE } from "~/utils/constants";
import { StatusCodes } from "http-status-codes";
import { movieModel } from "~/models/movieModel";
import ApiError from "~/utils/ApiError";

const getCategoryById = async (categoryId) => {
  try {
    const results = await categoryModel.getCategoryById(categoryId);
    //console.log('result: ', results)
    return results;
  } catch (error) {
    throw error;
  }
};

const getCategories = async (categories) => {
  try {
    if (!categories) categories = DEFAULT_VALUE;

    const results = await categoryModel.getCategories(parseInt(categories, 10));
    //console.log('result: ', results)
    return results;
  } catch (error) {
    throw error;
  }
};

const getMoviesByCategoryId = async (categoryId) => {
  try {
    const category = await categoryModel.getCategoryById(categoryId);
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Current category not found.");
    }

    const movies = await movieModel.getMoviesByCategoryId({
      _id: { $in: category.movieIds },
    });

    return movies;
  } catch (error) {
    throw error;
  }
};

export const categoryService = {
  getCategoryById,
  getCategories,
  getMoviesByCategoryId,
};
