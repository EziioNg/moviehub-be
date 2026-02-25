import Joi from "joi";

import { ObjectId } from "mongodb";

import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import ApiError from "~/utils/ApiError";

// khai báo collection cho movie
const MOVIE_COLLECTION_NAME = "movies"; // tên collection
const MOVIE_COLLECTION_SCHEMA = Joi.object({
  // tạo schema dưới dạng object json bằng joi
  title: Joi.string().required().min(3).max(50).trim().strict(),
  review: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  movieImage: Joi.string().required().min(3).max(50).trim().strict(),
  movieURL: Joi.string().required().trim().strict(),
  movieSub: Joi.string().required().trim().strict(),
  // type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  categoryIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  rating: Joi.number().min(0).max(10).precision(1),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

// const validateBeforeCreating = async (data) => {
//   return await MOVIE_COLLECTION_SCHEMA.validateAsync(data, {
//     abortEarly: false,
//   });
// };

// hàm tìm bản ghi movie theo movieId
const getDetails = async (movieId) => {
  try {
    if (!ObjectId.isValid(movieId)) {
      throw new ApiError(404, "Invalid movie ID");
    }
    // console.log(new ObjectId(id));
    const result = await GET_DB()
      .collection(MOVIE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(movieId),
      });
    if (!result) {
      throw new ApiError(404, "Movie not found");
    }
    return result; // trả về bản ghi movie đã tìm được cho service
  } catch (error) {
    throw error;
  }
};

const getMovies = async (movie, itemsPerPage) => {
  try {
    const query = await GET_DB()
      .collection(MOVIE_COLLECTION_NAME)
      .aggregate(
        [
          // sort title của movie theo A-Z
          { $sort: { title: 1 } },
          // $facet xử lý nhiều luồng trong 1 query
          {
            $facet: {
              // Luồng 1: Query lấy ra các movie
              queryMovies: [
                { $limit: itemsPerPage }, // giới hạn tối đa số lượng bản ghi trả về trên 1 page
              ],
              // Luồng 2: Query đếm tổng tất cả số lượng bản ghi movie trong db và trả về trong biến countedAllMovies
              queryTotalMovies: [{ $count: "countedAllMovies" }],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();
    //console.log('query: ', query)

    const res = query[0];

    return {
      movies: res.queryMovies || [],
      totalMovies: res.queryTotalMovies[0]?.countedAllMovies || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getMoviesByCategoryId = async (movie = {}) => {
  try {
    const query = await GET_DB()
      .collection(MOVIE_COLLECTION_NAME)
      .aggregate(
        [
          // Lọc theo điều kiện truyền vào (nếu có)
          { $match: movie },

          // Sắp xếp theo title A-Z
          { $sort: { title: 1 } },

          // Xử lý nhiều pipeline song song
          {
            $facet: {
              queryMovies: [],
              queryTotalMovies: [{ $count: "countedAllMovies" }],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();

    const res = query[0];

    return {
      movies: res.queryMovies || [],
      totalMovies: res.queryTotalMovies[0]?.countedAllMovies || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getMoviesBySeriesId = async (movie = {}) => {
  try {
    const query = await GET_DB()
      .collection(MOVIE_COLLECTION_NAME)
      .aggregate(
        [
          // Lọc theo điều kiện truyền vào (nếu có)
          { $match: movie },

          // Sắp xếp theo title A-Z
          { $sort: { title: 1 } },

          // Xử lý nhiều pipeline song song
          {
            $facet: {
              queryMovies: [],
              queryTotalMovies: [{ $count: "countedAllMovies" }],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();

    const res = query[0];

    return {
      movies: res.queryMovies || [],
      totalMovies: res.queryTotalMovies[0]?.countedAllMovies || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const searchMovies = async (query) => {
  try {
    const regexQuery = new RegExp(query, "i"); // tìm không phân biệt hoa thường
    const result = await GET_DB()
      .collection(MOVIE_COLLECTION_NAME)
      .find({ title: { $regex: regexQuery } })
      .limit(20)
      .toArray();

    return result;
  } catch (error) {
    throw new Error("Search error: " + error.message);
  }
};

const getManyByIds = async (ids) => {
  if (!ids || !ids.length) return [];

  const objectIds = ids.map((id) => new ObjectId(id));

  return await GET_DB()
    .collection(MOVIE_COLLECTION_NAME)
    .find({ _id: { $in: objectIds } })
    .toArray();
};

export const movieModel = {
  MOVIE_COLLECTION_NAME,
  MOVIE_COLLECTION_SCHEMA,
  getMovies,
  getMoviesByCategoryId,
  getMoviesBySeriesId,
  getDetails,
  searchMovies,
  getManyByIds,
};
