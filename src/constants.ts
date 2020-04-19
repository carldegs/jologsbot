const cmd = (msg: string) => `@jologsbot ${msg}`;
const msg = (cmd: string, action: string) => `Say \`${cmd}\` to ${action}`;

export const COMMANDS = {
  INITIALIZE_GAME: cmd("hoy"),
  JOIN_GAME: cmd("sali"),
  START_GAME: cmd("gballs"),
  SHOW_PLAYERS: cmd("dawho"),
  STOP_GAME: cmd("stahp"),
};

export const MESSAGES = {
  INITIALIZE_GAME: msg(COMMANDS.INITIALIZE_GAME, "initialize a game"),
  JOIN_GAME: msg(COMMANDS.JOIN_GAME, "join the game"),
  START_GAME: msg(COMMANDS.START_GAME, "start the game"),
  SHOW_PLAYERS: msg(COMMANDS.SHOW_PLAYERS, "see the list of players"),
};

export const cb = "```";
