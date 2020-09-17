import ProfileRatingView from "./view/profile-rating.js";
import SiteMenuView from "./view/menu.js";
import StatsTemplateView from "./view/stats.js";
import FilmsCounterView from "./view/films-counter.js";
import MoviesModel from "./model/movies.js";
import CommentsModel from "./model/comments.js";
import FilterModel from "./model/filter.js";

import {generateCard} from "./mock/film.js";
import {generateListOfComments} from "./mock/comment.js";
import {generateUserRank} from "./mock/user.js";
import MovieListPresenter from "./presenter/movie-list.js";
import FilterPresenter from "./presenter/filter.js";
import UserStatisticPresenter from "./presenter/user-statistic.js";
import {render, RenderPosition} from "./utils/render.js";
import {MenuItem, UpdateType, FilterType} from "./const.js";

const FilmsCount = {
  PER_STEP: 5,
  TOTAL: 20,
  EXTRA: 2
};

const COMMENTS_COUNT = 4;

// собирает в массив результаты вызова функции, генерирующей случайную карточку фильма
const cards = new Array(FilmsCount.TOTAL).fill(``).map(generateCard);
const comments = generateListOfComments();
let counter = 0;
const commentsID = comments.map((comment) => comment.id);
const getCommentsId = (film) => {
  film.comments = commentsID.slice(counter, COMMENTS_COUNT + counter);
  counter += COMMENTS_COUNT;
};
cards.forEach((card) => getCommentsId(card));

const cardsModel = new MoviesModel();
cardsModel.setCards(cards);

const commentsModel = new CommentsModel();
commentsModel.set(comments);

const filterModel = new FilterModel();

const siteHeaderElement = document.querySelector(`.header`);
const footerElement = document.querySelector(`.footer`);
const commentInput = document.querySelector(`.film-details__comment-input`);

// рисует звание пользователя на странице
render(siteHeaderElement, new ProfileRatingView(generateUserRank(cards)), RenderPosition.BEFOREEND);

const siteMainElement = document.querySelector(`.main`);

// рисует меню
const menuComponent = new SiteMenuView();
render(siteMainElement, menuComponent, RenderPosition.BEFOREEND);

const statsSectionSwitcher = new StatsTemplateView();
render(menuComponent, statsSectionSwitcher, RenderPosition.BEFOREEND);

const movieListPresenter = new MovieListPresenter(siteMainElement, footerElement, cardsModel, commentsModel, filterModel, commentInput);
const filterPresenter = new FilterPresenter(menuComponent, filterModel, cardsModel);

const userStatisticPresenter = new UserStatisticPresenter(siteMainElement, cardsModel.getCards());

const handleSiteMenuClick = (menuItem) => {
  switch (menuItem) {
    case MenuItem.MOVIES:
      statsSectionSwitcher.removeActiveClass();
      userStatisticPresenter.removeStatistics();

      movieListPresenter.init();
      movieListPresenter.renderExtraFilmsLists();
      break;
    case MenuItem.STATS:
      statsSectionSwitcher.addActiveClass();
      movieListPresenter.destroy();
      filterModel.set(UpdateType.DISABLED, FilterType.DISABLED);
      userStatisticPresenter.init();
      break;
  }
};

menuComponent.setMenuClickHandler(handleSiteMenuClick);

filterPresenter.init();
userStatisticPresenter.init();

// рисует счетчик фильмов в футере
const footerStatElement = footerElement.querySelector(`.footer__statistics`);
render(footerStatElement, new FilmsCounterView(cards), RenderPosition.BEFOREEND);

