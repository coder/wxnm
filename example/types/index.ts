import { NativeMessage } from "@coder/wxnm"

export interface RequestProcessIDMessage extends NativeMessage {
  type: "REQUEST_PROCID"
}

export type ExtensionMessage = RequestProcessIDMessage

export interface ProcessIDMessage extends NativeMessage {
  type: "PROCID"
  id: number
}

export type NodeMessage = ProcessIDMessage
