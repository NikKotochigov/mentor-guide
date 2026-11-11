import { fetchUser, type User } from "./api";

export function getUser(id: string): User {
  // TODO: кэш на уровне модуля, fetchUser, бросай тот же промис, пока данных нет
  throw new Error("TODO: реализуй getUser");
}

export function useUser(id: string): User {
  // TODO
  return getUser(id);
}
