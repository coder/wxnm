import { NativeMessage, MessageListener, DisconnectListener } from "../types"

export function createNodeMessenger<NodeMessage extends NativeMessage, ExtensionMessage extends NativeMessage>() {
  return new NodeNativeMessenger<NodeMessage, ExtensionMessage>();
}

export class NodeNativeMessenger<NodeMessage extends NativeMessage, ExtensionMessage extends NativeMessage> {
  private messageListeners: MessageListener<ExtensionMessage>[] = []
  private disconnectListeners: DisconnectListener[] = []

  constructor() {
    process.stdin.on('readable', this.handleStdin)
  }

  private handleStdin = () => {
    const input: unknown[] = []
    let chunk: unknown

    // eslint-disable-next-line no-cond-assign
    while (chunk = process.stdin.read()) {
      input.push(chunk)
    }

    const buff = Buffer.concat(input as Uint8Array[])
    const msgLen = buff.readUInt32LE(0)
    const dataLen = msgLen + 4

    if (buff.length > dataLen) {
      const content = input.slice(4, dataLen)
      const msg = JSON.parse(content.toString())
      this.handleMessage(msg)
    }
  }

  private handleMessage(msg: unknown) {
    this.messageListeners.forEach(listener => {
      listener(msg as ExtensionMessage)
    })
  }

  /**
   * Attach a listener for when the extension disconnects from the node app
   * @param listener Function to call when the extension disconnects
   * @returns Unlisten function
   */
  onDisconnect(listener: DisconnectListener) {
    this.disconnectListeners.push(listener)
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter(l => l !== listener)
    }
  }

  /**
   * Attach a listener for when messages are received
   * @param listener Function to call with the message when received
   * @returns Unlisten function
   */
  onMessage(listener: MessageListener<ExtensionMessage>) {
    this.messageListeners.push(listener)
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener)
    }
  }

  /**
   * Send a message to the browser extension via stdout
   * @param msg JSON serializable NodeMessage object
   */
  sendMessage(msg: NodeMessage) {
    const json = JSON.stringify(msg)
    const header = Buffer.alloc(4)
    header.writeUInt32LE(json.length, 0)

    process.stdout.write(header)
    process.stdout.write(json)
  }
}
