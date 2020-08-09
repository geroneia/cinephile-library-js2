import {getRandomInteger, getSomeShuffledSubjects} from "../utils.js";
import {NAMES} from "./film.js";
const MAX_DAYS_GAP = 7;
const MAX_COMMENTS_COUNT = 5;

const MESSAGES = [
  `Interesting setting and a good cast`,
  `Booooooooooring`,
  `Very very old. Meh`,
  `Almost two hours? Seriously?`
];

const EMOJI = [`smile`, `sleeping`, `puke`, `angry`];

// получает дату комментария
const generateCommentDate = () => {
  const daysGap = getRandomInteger(0, MAX_DAYS_GAP);
  const currentDate = new Date();

  currentDate.setHours(23, 59, 59, 999);

  currentDate.setDate(currentDate.getDate() - daysGap);

  return new Date(currentDate);
};

const generateComment = () => ({
  message: getSomeShuffledSubjects(MESSAGES),
  emoji: EMOJI[getRandomInteger(0, EMOJI.length - 1)],
  name: NAMES[getRandomInteger(0, NAMES.length - 1)],
  currentDate: generateCommentDate(),
});

export const generateListOfComments = () => {
  const commentCount = getRandomInteger(0, MAX_COMMENTS_COUNT);
  const listOfComments = [];
  for (let i = 0; i < commentCount; i++) {
    listOfComments.push(generateComment());
  }
  return listOfComments;
};