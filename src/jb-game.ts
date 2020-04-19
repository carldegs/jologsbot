import { User, Channel } from "discord.js";
import {
  Callback,
  JBGameOptions,
  JBQuestion,
  StartGameCallback,
} from "./types";
import range from "lodash/range";
import sampleSize from "lodash/sampleSize";
import questionsDB from "./data.json";

export const ERR_DUPLICATE_USER = "User already exists in game";
export const ERR_GAME_ALREADY_STARTED = "Game already started";

export class JBGame {
  public users: Record<string, User> = {};
  public started: boolean = false;
  public options: JBGameOptions = {
    numQuestions: 10,
    guessTime: 10000,
  };
  public questions: JBQuestion[] = [];
  questionTimeouts: any[] = [];

  constructor(public channel: Channel) {}

  public hasUser(userID: string): boolean {
    return !!this.users[userID];
  }

  public addUser(user: User, callback?: Callback) {
    if (this.hasUser(user.id)) {
      callback?.error(ERR_DUPLICATE_USER);
      return;
    }

    this.users = {
      ...this.users,
      [user.id]: user,
    };

    callback?.success();
  }

  public startGame(callback: StartGameCallback) {
    if (this.started) {
      callback.error(ERR_GAME_ALREADY_STARTED);
      return;
    }

    this.started = true;
    this.questions = sampleSize(questionsDB, this.options.numQuestions);

    let limit = 0;
    while (this.questions.length < this.options.numQuestions && limit < 20) {
      this.questions = [
        ...this.questions,
        ...sampleSize(
          questionsDB,
          this.options.numQuestions - this.questions.length
        ),
      ];
      limit++;
    }

    this.askQuestion(callback, 0);
  }

  private askQuestion(callback: StartGameCallback, i: number) {
    if (i >= this.options.numQuestions) {
      callback.finish();
      return;
    }

    const question = this.questions[i];
    const clueInterval = this.options.guessTime / 4;
    const clues = this.getClues(question.answer);

    callback.prompt(`Question ${i + 1}:\n${question.question}`);

    this.questionTimeouts.push(
      setTimeout(() => {
        callback.prompt(clues[0]);

        this.questionTimeouts.push(
          setTimeout(() => {
            callback.prompt(clues[1]);

            this.questionTimeouts.push(
              setTimeout(() => {
                callback.prompt(clues[2]);

                this.questionTimeouts.push(
                  setTimeout(() => {
                    callback.timeout(
                      `The correct answer is ${question.answer}`
                    );

                    this.questionTimeouts.push(
                      setTimeout(() => {
                        this.askQuestion(callback, i + 1);
                      }, 1)
                    );
                  }, clueInterval)
                );
              }, clueInterval)
            );
          }, clueInterval)
        );
      }, clueInterval)
    );
  }

  private getClues(answer: string): string[] {
    let answerChars = answer.split("");
    let numLettersShown = Math.floor(answerChars.length * 0.5);
    numLettersShown =
      numLettersShown > answerChars.length
        ? answerChars.length
        : numLettersShown;
    const lettersShown = sampleSize(range(answerChars.length), numLettersShown);
    let clues = [];

    for (let i = 1; i <= 3; i++) {
      clues.push(this.getClue(answerChars, i, lettersShown));
    }
  
    return clues;
  }

  private getClue(
    answer: string[],
    level: number,
    lettersShown: number[]
  ): string {
    return level + ": " + answer
      .map((char, i) => {
        if (char === " ") {
          return "  ";
        }

        const limit = Math.floor(lettersShown.length / 2);
        if (level === 2 && lettersShown.slice(0, limit).includes(i)) {
          return `${char} `;
        }

        if (level === 3 && lettersShown.includes(i)) {
          return `${char} `;
        }

        return "▫";
      })
      .join("");
  }

  public stopGame() {
    this.questionTimeouts.forEach((timeout) => clearTimeout(timeout));
  }
}
