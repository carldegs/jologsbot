export const pluralize = (word: string, isPlural: boolean | any[], options?: { uppercase: boolean }) => {
  if (Array.isArray(isPlural)) {
    isPlural = isPlural.length !== 1;
  }

  let suffix = "s";

  if(options?.uppercase) {
    suffix = "S";    
  }

  return `${word}${isPlural ? "S" : ""}`;
};
