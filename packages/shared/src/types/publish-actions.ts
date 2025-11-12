export const publishActions = {
  UPDATE_CHAT: "UPDATE_CHAT",
  DELETE_CHAT: "DELETE_CHAT",
} as const;

export type PublishAction =
  (typeof publishActions)[keyof typeof publishActions];
