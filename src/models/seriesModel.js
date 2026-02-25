import Joi from "joi";
// import { ObjectId } from 'mongodb'

import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { ObjectId } from "mongodb";

// khai báo collection cho movie
const SERIES_COLLECTION_NAME = "series"; // tên collection
const SERIES_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().strict(),
  movieIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const getSeriesById = async (seriesId) => {
  try {
    const result = await GET_DB()
      .collection(SERIES_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(seriesId),
      });
    return result; // trả về bản ghi đã tìm được cho service
  } catch (error) {
    throw new Error("Error: ", error);
  }
};

const getAllSeries = async (series) => {
  try {
    const query = await GET_DB()
      .collection(SERIES_COLLECTION_NAME)
      .aggregate(
        [
          // sort title của movie theo A-Z
          { $sort: { title: 1 } },
          // $facet xử lý nhiều luồng trong 1 query
          {
            $facet: {
              // Luồng 1: Query lấy ra các movie
              querySeries: [
                //{ $limit: itemsPerPage } // giới hạn tối đa số lượng bản ghi trả về trên 1 page
              ],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();
    //console.log('query: ', query)

    const res = query[0];

    return {
      series: res.querySeries || [],
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getSeriesByMovieId = async (series = {}) => {
  try {
    const query = await GET_DB()
      .collection(SERIES_COLLECTION_NAME)
      .aggregate(
        [
          { $match: series },
          { $sort: { title: 1 } },
          {
            $facet: {
              querySeries: [],
              queryTotalSeries: [{ $count: "countedAllSeries" }],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();

    const res = query[0];

    return {
      categories: res.querySeries || [],
      totalSeries: res.queryTotalSeries[0]?.countedAllSeries || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const seriesModel = {
  SERIES_COLLECTION_NAME,
  SERIES_COLLECTION_SCHEMA,
  getAllSeries,
  getSeriesById,
  getSeriesByMovieId,
};
