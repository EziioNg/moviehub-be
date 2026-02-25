import { movieService } from "~/services/movieService";
import { StatusCodes } from "http-status-codes";

const getMovies = async (req, res, next) => {
  try {
    // console.log('userId: ', req.jwtDecoded._id)
    // const userId = req.jwtDecoded._id
    // movie và itemsPerPage được truyền vào query url từ phía FE nên BE sẽ lấy được qua req.query
    const { movie, itemsPerPage } = req.query;
    const result = await movieService.getMovies(movie, itemsPerPage);

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getDetails = async (req, res, next) => {
  try {
    // in ra các param từ request của client
    // console.log('req.params: ', req.params)

    // lấy id từ param trên url gán cho movieId
    const movieId = req.params.id;
    // console.log("movie id: ", movieId);

    // lấy movie theo id
    const movie = await movieService.getDetails(movieId);

    // trả board về cho client
    res.status(StatusCodes.OK).json(movie);
    // console.log('🔥 Middleware isAuthorized is being used!')
    // console.log('movie: ', movie)
  } catch (error) {
    next(error);
  }
};

const searchMovies = async (req, res, next) => {
  try {
    const query = req.query.query;
    const movies = await movieService.searchMovies(query);
    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
};

const getCategoriesByMovieId = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    //console.log('movieId received: ', movieId)
    const categories = await movieService.getCategoriesByMovieId(movieId);
    //console.log('categories received: ', categories)
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const movieController = {
  getMovies,
  getDetails,
  searchMovies,
  getCategoriesByMovieId,
};
