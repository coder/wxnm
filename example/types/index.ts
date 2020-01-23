import { NativeMessage } from "@coder/wxnm"

export interface RequestStatsMessage extends NativeMessage {
  type: "REQUEST_STATS"
}

export type ExtensionMessage = StatsMessage

export interface StatsMessage extends NativeMessage {
  type: "STATS"
  cpu: number
  ram: number
  hdd: number
}

export type NodeMessage = StatsMessage
