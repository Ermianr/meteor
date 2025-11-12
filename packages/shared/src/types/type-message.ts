export const typeMessage = {
  TEXT: "UPDATE_CHAT",
} as const;

export type TypeMessage = (typeof typeMessage)[keyof typeof typeMessage];
