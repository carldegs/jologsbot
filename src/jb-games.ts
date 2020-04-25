import { JBGame, ERR_DUPLICATE_USER } from "./jb-game";
import { Channel, User } from "discord.js";
import { Callback, StartGameCallback } from "./types";

export const ERR_DUPLICATE_GAME = "Game already exists";
export const ERR_GAME_NOT_FOUND = "Game not found";

export class JBGames {
  constructor(public games: Record<string, JBGame> = {}) {}

  public getGames(): Record<string, JBGame> {
    return this.games;
  }

  public getGamesArr(): JBGame[] {
    return Object.values(this.games);
  }

  public getGame(channelID: string): JBGame {
    return this.games[channelID];
  }

  public hasGame(channelID: string): boolean {
    return !!this.getGame(channelID);
  }

  public getUsers(channelID: string): Record<string, User> {
    return this.getGame(channelID)?.users;
  }

  public getUsersArr(channelID: string): User[] {
    const users = this.getUsers(channelID);
    return users ? Object.values(users) : [];
  }

  public gameHasUser(channelID: string, userID: string): boolean {
    return !!this.getGame(channelID)?.hasUser(userID);
  }

  public initializeGame(channel: Channel, callback?: Callback) {
    if (this.hasGame(channel.id)) {
      callback?.error(ERR_DUPLICATE_GAME);
      return;
    }

    this.games = {
      ...this.games,
      [channel.id]: new JBGame(channel),
    };

    callback?.success();
  }

  public AddUserToGame(channelID: string, user: User, callback?: Callback) {
    if (!this.hasGame(channelID)) {
      callback?.error(ERR_GAME_NOT_FOUND);
      return;
    }

    if (this.gameHasUser(channelID, user.id)) {
      callback?.error(ERR_DUPLICATE_USER);
      return;
    }

    const game = this.getGame(channelID);
    game.addUser(user, {
      success: () => callback?.success(game),
      error: (err: string) => callback?.error(err),
    });
  }

  public startGame(channelID: string, callback: StartGameCallback) {
    const game = this.getGame(channelID);

    if (!game) {
      callback.error(ERR_GAME_NOT_FOUND);
      return;
    }

    game.startGame(callback);
  }

  public stopGame(channelID: string, callback: Callback) {
    const game = this.getGame(channelID);

    if (!game) {
      callback.error(ERR_GAME_NOT_FOUND);
      return;
    }

    console.log('stop game');
    // TODO: get data to print
    game.stopGame();
    const { [channelID]: remove, ...games } = this.games;
    this.games = games;
    callback.success();
  }

  public checkAnswer(channelID: string, userID: string, answer: string, callback: Callback) {
    const game = this.getGame(channelID);

    if (!game) {
      callback.error(ERR_GAME_NOT_FOUND);
      return;
    }

    game.checkAnswer(userID, answer, callback);
  }
}
