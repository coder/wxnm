import { browser, Runtime } from "webextension-polyfill-ts"
import { NativeMessage, MessageListener, DisconnectListener } from "../types";

/**
 * Instantiates an ExtensionNativeMessenger for communication with a native application
 * @param application The name of the application as defined in its manifest
 */
export function createExtensionMessenger<ExtensionMessage extends NativeMessage, NodeMessage extends NativeMessage>(application: string) {
  return new ExtensionNativeMessenger<ExtensionMessage, NodeMessage>(application);
}

export class ExtensionNativeMessenger<ExtensionMessage extends NativeMessage, NodeMessage extends NativeMessage> {
  private port: Runtime.Port

  constructor(application: string) {
    this.port = browser.runtime.connectNative(application)
  }

  /**
   * Disconnect from the native application, triggers onDisconnect listeners
   */
  disconnect() {
    this.port.disconnect()
  }

  /**
   * Attach a listener for when the extension disconnects from the node app
   * @param listener Function to call when the extension disconnects
   * @returns Unlisten function
   */
  onDisconnect(_listener: DisconnectListener) {
    const listener = () => {
      _listener(browser.runtime.lastError ? new Error(browser.runtime.lastError.message) : undefined)
    }

    this.port.onDisconnect.addListener(listener)
    return () => {
      this.port.onDisconnect.removeListener(listener)
    }
  }

  /**
   * Attach a listener for when messages are received
   * @param listener Function to call with the message when received
   * @returns Unlisten function
   */
  onMessage(_listener: MessageListener<NodeMessage>) {
    const listener = (msg: unknown) => {
      console.debug(msg)
      _listener(msg as NodeMessage)
    }

    this.port.onMessage.addListener(listener)
    return () => {
      this.port.onMessage.removeListener(listener)
    }
  }

  /**
   * Send a message to the browser extension via stdout
   * @param msg JSON serializable NodeMessage object
   */
  sendMessage(msg: ExtensionMessage) {
    this.port.postMessage(msg)
  }
}
