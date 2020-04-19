import { Bot } from "./bot";

// Run dotenv
require("dotenv").config();

const bot = new Bot();
bot.listen();