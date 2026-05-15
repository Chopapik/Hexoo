import { Filter } from "bad-words";
import polishBadWords from "naughty-words/pl.json";

const filter = new Filter();
filter.addWords(...polishBadWords);

export const isUsernameProfane = (username: string): boolean => {
  return filter.isProfane(username.trim().toLowerCase());
};
