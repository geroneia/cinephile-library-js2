import moment from "moment";

export const sortByDate = (a, b) => moment(b.releaseDate).diff(a.releaseDate, `day`);


export const sortByRating = (a, b) => b.rating - a.rating;

export const sortByComments = (a, b) => b.comments.length - a.comments.length;

export const formatCardReleaseYear = (releaseDate) => moment(releaseDate).format(`YYYY`);

export const formatCardReleaseDate = (releaseDate) => moment(releaseDate).format(`DD MMMM YYYY`);

export const formatCardRuntime = (runtime) => moment.utc(moment.duration(runtime, `minutes`).asMilliseconds()).format(`h[h] mm[m]`);

export const formatCommentDate = (commentsDate) => moment(commentsDate).fromNow();

// export const generateId = () => Date.now() + parseInt(Math.random() * 10000, 10);

export const getCurrentDate = () => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  return new Date(currentDate);
};

export const getEarliestDate = () => new Date(0);

export const isDatesEqual = (dateA, dateB) => {
  if (dateA === null && dateB === null) {
    return true;
  }

  return moment(dateA).isSame(dateB, `day`);
};

export const getOverallDuration = (movies) => {
  const duration = movies.length !== 0 ?
    movies.map((movie) => movie.runtime).reduce((a, b) => a + b) : 0;

  const lengthInHours = Math.floor(duration / 60);
  const lengthInMinutes = duration % 60;
  const hours = lengthInHours > 0 ? lengthInHours + `h` : `0`;
  const minutes = lengthInMinutes > 0 ? lengthInMinutes + `m` : ``;

  return `${hours} ${minutes}`;
};

const Ranks = {
  NOVICE: `novice`,
  FAN: `fan`,
  MOVIE_BUFF: `movie buff`
};

export const getWatchedFilmsCount = (films) =>
  films.filter((film) => film.isWatched).length;

export const generateUserRank = (watchedFilmsCount) => {

  // const watchedFilmsCount = getWatchedFilmsCount(cards);
  let userRank = ``;

  if (watchedFilmsCount > 0 && watchedFilmsCount <= 10) {
    userRank = Ranks.NOVICE;
  } else if (watchedFilmsCount > 10 && watchedFilmsCount <= 20) {
    userRank = Ranks.FAN;
  } else if (watchedFilmsCount > 20) {
    userRank = Ranks.MOVIE_BUFF;
  }
  return userRank;
};
