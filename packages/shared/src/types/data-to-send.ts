import type { Message } from "./message";
import type { PublishAction } from "./publish-actions";
import type { TypeMessage } from "./type-message";

export type DataToSend = {
  type: TypeMessage;
  action: PublishAction;
  message: Message;
};
