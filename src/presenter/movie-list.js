import SortingView from "../view/sorting.js";
import BoardView from "../view/board.js";
import FilmsListView from "../view/films-list.js";
import BestFilmsView from "../view/best-films-list.js";
import CommentedFilmsView from "../view/commented-films-list.js";
import ShowMoreButtonView from "../view/show-more-button.js";
import NoFilmsView from "../view/no-films.js";
import CardPresenter from "../presenter/card.js";
import {SortType} from "../view/sorting.js";
import {render, RenderPosition, remove} from "../utils/render.js";
import {filter} from "../utils/filter.js";
import {sortByDate, sortByRating, sortByComments} from "../utils/card.js";
import {UpdateType, UserAction} from "../const.js";

const FilmsCount = {
  PER_STEP: 5,
  EXTRA: 2
};

export default class MovieList {
  constructor(movieListContainer, popupContainer, cardsModel, commentsModel, filterModel) {
    this._movieListContainer = movieListContainer;
    this._popupContainer = popupContainer;
    this._cardsModel = cardsModel;
    this._commentsModel = commentsModel;
    this._filterModel = filterModel;
    this._renderedCardCount = FilmsCount.PER_STEP;
    this._currentSortType = SortType.DEFAULT;
    this._cardPresenterCommonFilmsList = {};
    this._cardPresenterBestFilmsList = {};
    this._cardPresenterMostCommentedFilmsList = {};

    this._sortComponent = null;
    this._showMoreButtonComponent = null;

    this._sortedByRatingsFilms = {};
    this._sortedByCommentsFilms = {};

    this._boardComponent = new BoardView();
    this._filmsListComponent = new FilmsListView();
    this._bestFilmsComponent = new BestFilmsView();
    this._commentedFilmsComponent = new CommentedFilmsView();
    this._noFilmsComponent = new NoFilmsView();

    this._handleViewAction = this._handleViewAction.bind(this);
    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleShowMoreButtonClick = this._handleShowMoreButtonClick.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);

    this._cardsModel.addObserver(this._handleModelEvent);
    this._commentsModel.addObserver(this._handleModelEvent);
    this._filterModel.addObserver(this._handleModelEvent);
  }

  init() {
    this._renderSort();

    if (this._getCards().length === 0) {
      this._renderNoFilms();
      return;
    }
    this._renderBoard();
  }

  _getCards() {
    const filterType = this._filterModel.getFilter();
    const cards = this._cardsModel.getCards();
    const filtredCards = filter[filterType](cards);

    switch (this._currentSortType) {
      case SortType.BY_DATE:
        return filtredCards.sort(sortByDate);
      case SortType.BY_RATING:
        return filtredCards.sort(sortByRating);
    }
    return filtredCards;
  }

  _handleModeChange() {
    [
      ...Object.values(this._cardPresenterCommonFilmsList),
      ...Object.values(this._cardPresenterBestFilmsList),
      ...Object.values(this._cardPresenterMostCommentedFilmsList)
    ].forEach((presenter) => presenter.resetView());
  }

  _updatePresenter(presenters, updatedCard, commentsList) {
    if (presenters[updatedCard.id] !== undefined) {
      presenters[updatedCard.id].init(updatedCard, commentsList);
    }
  }

  _handleViewAction(actionType, updateType, updateCard, updateComments, updateComment) {
    console.log(actionType, updateType, updateCard, updateComments);
    switch (actionType) {
      case UserAction.UPDATE_CARD:
        this._cardsModel.updateCard(updateType, updateCard, updateComments);
        break;
      case UserAction.ADD_COMMENT:
        this._commentsModel.addComment(updateType);
        this._cardsModel.updateCard(updateType, updateCard, updateComments);
        break;
      case UserAction.DELETE_COMMENT:
        this._commentsModel.deleteComment(updateType, updateCard, updateComments, updateComment);
        break;
    }
  }

  _handleModelEvent(updateType, data, updateComments, updateComment) {
    console.log(updateType, data, updateComments, updateComment);
    switch (updateType) {
      case UpdateType.PATCH:
        this._updatePresenter(this._cardPresenterCommonFilmsList, data, updateComments);
        this._updatePresenter(this._cardPresenterBestFilmsList, data, updateComments);
        this._updatePresenter(this._cardPresenterMostCommentedFilmsList, data, updateComments);
        break;
      case UpdateType.MINOR:
        this._clearBoard();
        this._renderSort();
        this._renderBoard();
        break;
      case UpdateType.MAJOR:
        this._clearBoard({resetRenderedCardCount: true, resetSortType: true});
        this._renderSort();
        this._renderBoard();
        break;
    }
  }

  _handleSortTypeChange(sortType) {
    if (this._currentSortType === sortType) {
      return;
    }

    this._currentSortType = sortType;
    this._clearBoard({resetRenderedCardCount: true});
    this._renderSort();
    this._renderBoard();
  }

  _renderSort() {
    if (this._sortComponent !== null) {
      this._sortComponent = null;
    }

    this._sortComponent = new SortingView(this._currentSortType);
    this._sortComponent.setSortTypeChangeHandler(this._handleSortTypeChange);
    render(this._movieListContainer, this._sortComponent, RenderPosition.BEFOREEND);
  }

  _renderCard(container, movieCard, commentsList, presenterStore) {
    // фильтрует массив комментариев, отбирая те, которые проходят проверку на то,
    // что массив ID в карточке содержит ID комментария в массиве комментариев
    const comments = commentsList.filter(({id}) => movieCard.comments.includes(id));
    const cardPresenter = new CardPresenter(container, this._popupContainer, this._handleViewAction, this._handleModeChange);
    cardPresenter.init(movieCard, comments);
    presenterStore[movieCard.id] = cardPresenter;
  }

  _renderCards(container, cards, commentsList) {
    cards.forEach((card) => this._renderCard(container, card, commentsList, this._cardPresenterCommonFilmsList));
  }

  _renderNoFilms() {
    render(this._movieListContainer, this._noFilmsComponent, RenderPosition.BEFOREEND);
  }

  _handleShowMoreButtonClick() {

    const cardCount = this._getCards().length;
    const newRenderedCardCount = Math.min(cardCount, this._renderedCardCount + FilmsCount.PER_STEP);
    const cards = this._getCards().slice(this._renderedCardCount, newRenderedCardCount);
    const comments = this._commentsModel.getComments().slice();

    this._renderCards(this._filmsListComponent.getElement().querySelector(`.films-list .films-list__container`), cards, comments);
    this._renderedCardCount = newRenderedCardCount;

    if (this._renderedCardCount >= cardCount) {
      remove(this._showMoreButtonComponent);
    }
  }

  _renderShowMoreButton(container) {
    if (this._showMoreButtonComponent !== null) {
      this._showMoreButtonComponent = null;
    }

    this._showMoreButtonComponent = new ShowMoreButtonView();
    render(container, this._showMoreButtonComponent, RenderPosition.AFTEREND);
    this._showMoreButtonComponent.setClickHandler(this._handleShowMoreButtonClick);
  }

  _clearFilmsListContainer() {
    Object
      .values(this._cardPresenterCommonFilmsList)
      .forEach((presenter) => presenter.destroy());
    this._cardPresenterCommonFilmsList = {};
    this._renderedCardCount = FilmsCount.PER_STEP;
  }

  _clearBoard({resetRenderedCardCount = false, resetSortType = false} = {}) {
    const cardCount = this._getCards().length;

    [
      ...Object.values(this._cardPresenterCommonFilmsList),
      ...Object.values(this._cardPresenterBestFilmsList),
      ...Object.values(this._cardPresenterMostCommentedFilmsList)
    ].forEach((presenter) => presenter.destroy());

    this._cardPresenterCommonFilmsList = {};
    this._cardPresenterBestFilmsList = {};
    this._cardPresenterMostCommentedFilmsList = {};

    remove(this._sortComponent);
    remove(this._noFilmsComponent);
    remove(this._showMoreButtonComponent);

    if (resetRenderedCardCount) {
      this._renderedCardCount = FilmsCount.PER_STEP;
    } else {
      this._renderedCardCount = Math.min(cardCount, this._renderedCardCount);
    }

    if (resetSortType) {
      this._currentSortType = SortType.DEFAULT;
    }
  }

  _renderFilmsListContainer() {
    render(this._boardComponent, this._filmsListComponent, RenderPosition.BEFOREEND);
    const filmsListContainer = this._filmsListComponent.getElement().querySelector(`.films-list .films-list__container`);
    this._renderFilmsList(filmsListContainer);
  }

  _renderFilmsList(container) {
    // рисует основной список фильмов
    const cardCount = this._getCards().length;
    const cards = this._getCards();
    const commentsList = this._commentsModel.getComments().slice();

    this._renderCards(container, cards.slice(0, Math.min(cardCount, this._renderedCardCount)), commentsList);

    if (cardCount > this._renderedCardCount) {
      this._renderShowMoreButton(container);
    }
  }

  _renderBestFilmsList() {
    // рисует дополнительные списки фильмов
    render(this._boardComponent, this._bestFilmsComponent, RenderPosition.BEFOREEND);

    const bestFilmsListElement = this._boardComponent.getElement().querySelector(`.films-list--extra .films-list__container`);

    this._sortedByRatingsFilms = this._getCards().slice().sort(sortByRating);

    this._commentsList = this._commentsModel.getComments().slice();

    for (let i = 0; i < FilmsCount.EXTRA; i++) {
      this._renderCard(bestFilmsListElement, this._sortedByRatingsFilms[i], this._commentsList, this._cardPresenterBestFilmsList);
    }
  }

  _renderMostCommentedFilmsList() {
    render(this._boardComponent, this._commentedFilmsComponent, RenderPosition.BEFOREEND);

    const commentedFilmsListElement = this._boardComponent.getElement().querySelector(`.films-list--extra:last-of-type .films-list__container`);

    this._sortedByCommentsFilms = this._getCards().slice().sort(sortByComments);

    this._commentsList = this._commentsModel.getComments().slice();

    for (let i = 0; i < FilmsCount.EXTRA; i++) {
      this._renderCard(commentedFilmsListElement, this._sortedByCommentsFilms[i], this._commentsList, this._cardPresenterMostCommentedFilmsList);
    }
  }

  _renderBoard() {
    render(this._movieListContainer, this._boardComponent, RenderPosition.BEFOREEND);
    this._renderFilmsListContainer();
    this._renderBestFilmsList();
    this._renderMostCommentedFilmsList();
  }
}
