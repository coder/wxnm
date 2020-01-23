export interface NativeMessage {
  type: string | number
}

export type MessageListener<T extends NativeMessage> = (msg: T) => void
export type DisconnectListener = (err?: Error) => void
