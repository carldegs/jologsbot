import { Client, Message } from "discord.js";
import { COMMANDS, cb, MESSAGES } from "./constants";
import { JBGame, ERR_DUPLICATE_USER } from "./jb-game";
import { JBGames, ERR_DUPLICATE_GAME, ERR_GAME_NOT_FOUND } from "./jb-games";
import { pluralize } from "./helpers";
import { JBScore } from "./types";

export class Bot {
  private games = new JBGames();

  public listen(): Promise<string> {
    const client = new Client();

    client.on("message", (msg: Message) => {
      if (msg.author.id !== process.env.CLIENT_ID) {
        switch (msg.cleanContent) {
          case COMMANDS.INITIALIZE_GAME:
            return this.initializeGame(msg);
          case COMMANDS.JOIN_GAME:
            return this.joinGame(msg);
          case COMMANDS.SHOW_PLAYERS:
            return this.showPlayers(msg);
          case COMMANDS.START_GAME:
            return this.startGame(msg);
          case COMMANDS.STOP_GAME:
            return this.stopGame(msg);
          case "@jologsbot g":
            this.initializeGame(msg);
            this.joinGame(msg);
            this.startGame(msg);
            break;
          default:
            return this.checkAnswer(msg);
        }
      }
    });

    client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`));
    return client.login(process.env.DISCORD_TOKEN);
  }

  initializeGame(msg: Message) {
    this.games.initializeGame(msg.channel, {
      success: () => msg.reply(`Game initiated! ${MESSAGES.JOIN_GAME}`),
      error: (err: string) => {
        if ((err = ERR_DUPLICATE_GAME)) {
          msg.reply(
            `A game is already initiated in this channel. ${MESSAGES.JOIN_GAME}`
          );
        }
      },
    });
  }

  joinGame(msg: Message) {
    const { channel, author } = msg;
    const channelID = channel.id;

    this.games.AddUserToGame(channelID, author, {
      success: () => {
        const users = this.games.getUsersArr(channelID);
        channel.send(
          `${author.username} added! ${users.length} ${pluralize(
            "player",
            users
          )}`
        );
      },
      error: (err: string) => {
        switch (err) {
          case ERR_GAME_NOT_FOUND:
            msg.reply(`No game initialized! ${MESSAGES.INITIALIZE_GAME}`);
            break;
          case ERR_DUPLICATE_USER:
            msg.reply(`you already joined the game! ${MESSAGES.START_GAME}`);
            break;
          default:
            msg.reply(err);
            break;
        }
      },
    });
  }

  showPlayers(msg: Message) {
    const { channel } = msg;

    if (!this.games.hasGame(channel.id)) {
      channel.send(`No game initialized! ${MESSAGES.INITIALIZE_GAME}`);
      return;
    }

    const users = this.games.getUsersArr(channel.id);
    const usersMsg = users
      .map((user, i) => `${i + 1}. ${user.username}`)
      .join("\n");

    channel.send(
      `${users.length} ${pluralize("PLAYER", users, {
        uppercase: true,
      })}\n${usersMsg}`
    );
  }

  startGame(msg: Message) {
    const { channel } = msg;
    this.games.startGame(msg.channel.id, {
      prompt: (prompt: string) => {
        channel.send(prompt);
      },
      correct: () => {},
      timeout: (text: string) => {
        channel.send(text);
      },
      finish: () => {
        channel.send("Game done!");
      },
      error: (err: string) => {
        channel.send(err);
      },
    });
  }

  stopGame(msg: Message) {
    const { channel } = msg;
    this.games.stopGame(channel.id, {
      success: () => channel.send("Stop!"),
      error: (err: string) => channel.send(err),
    });
  }

  checkAnswer(msg: Message) {
    const { channel, author, cleanContent } = msg;
    if (this.games.gameHasUser(msg.channel.id, msg.author.id)) {
      this.games.checkAnswer(channel.id, author.id, cleanContent, {
        success: (answer: string, scores: JBScore[]) => {
          channel.send(
            `May tama ka ${author.username}!\nAnswer: ${answer}\n\n${scores.map(
              (item, i) => `${i + 1}. ${item.username} - ${item.score}`
            )}`
          );
        },
        error: (err: string) => channel.send(err),
      });
    }
  }
}
