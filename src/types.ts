export type Callback = { success: Function; error: Function };

export type StartGameCallback = {
  prompt: Function,
  correct: Function,
  timeout: Function,
  finish: Function,
  error: Function,
}

export type JBGameOptions = {
  numQuestions: number,
  guessTime: number,
}

export type JBQuestion = {
  question: string,
  answer: string,
}