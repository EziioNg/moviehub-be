import Joi from "joi";
// import { ObjectId } from 'mongodb'

import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { ObjectId } from "mongodb";

// khai báo collection cho movie
const CATEGORY_COLLECTION_NAME = "categories"; // tên collection
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().strict(),
  movieIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const getCategoryById = async (categoryId) => {
  try {
    const result = await GET_DB()
      .collection(CATEGORY_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(categoryId),
      });
    return result; // trả về bản ghi đã tìm được cho service
  } catch (error) {
    throw new Error("Error: ", error);
  }
};

const getCategories = async (categories) => {
  try {
    const query = await GET_DB()
      .collection(CATEGORY_COLLECTION_NAME)
      .aggregate(
        [
          // sort title của movie theo A-Z
          { $sort: { title: 1 } },
          // $facet xử lý nhiều luồng trong 1 query
          {
            $facet: {
              // Luồng 1: Query lấy ra các movie
              queryCategories: [
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
      categories: res.queryCategories || [],
    };
  } catch (error) {
    throw new Error(error);
  }
};

const getCategoriesByMovieId = async (category = {}) => {
  try {
    const query = await GET_DB()
      .collection(CATEGORY_COLLECTION_NAME)
      .aggregate(
        [
          { $match: category },
          { $sort: { title: 1 } },
          {
            $facet: {
              queryCategories: [],
              queryTotalCategories: [{ $count: "countedAllCategories" }],
            },
          },
        ],
        { collation: { locale: "en" } },
      )
      .toArray();

    const res = query[0];

    return {
      categories: res.queryCategories || [],
      totalCategories: res.queryTotalCategories[0]?.countedAllCategories || 0,
    };
  } catch (error) {
    throw new Error(error);
  }
};

export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  getCategories,
  getCategoryById,
  getCategoriesByMovieId,
};
