# (W)eb E(x)tension (N)ative (M)essenger

`wxnm` is a TypeScript library for providing typed communication between your web extension and your native Node application using [Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging). It also provides some utilities for installing your native application's app manifest.

`wxnm` is meant for long-running applications and uses the [`runtime.connectNative`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connectNative) API under the hood. If your use case only requires infrequent, one-off messages to be sent, it's recommended you use [`runtime.sendNativeMessage`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendNativeMessage) directly.

## Compatibility

| Browser       | Windows | Linux | Mac |
| :------------ | :-----: | :---: | :-: |
| Firefox       |    ✕    |   ✓   |  ✓  |
| Waterfox      |    ✕    |   ✓   |  ✓  |
| Chrome        |    ✕    |   ✓   |  ✓  |
| Chrome Canary |    ✕    |       |  ✓  |
| Chrome Beta   |    ✕    |   ✓   |     |
| Chromium      |         |   ✓   |  ✓  |
| Brave         |    ✕    |   ✓   |  ✓  |
| Opera         |    ✕    |   ✕   |  ✓  |
| Vivaldi       |    ✕    |   ✓   |  ✓  |

<small>✓ - supported</small>
<small>✕ - not supported</small>
<small>blank - OS does not support this browser</small>

Windows support is a WIP

## Installation

```bash
npm install @coder/wxnm
# or #
yarn add @coder/wxnm
```

## Example

See the [`example` directory](/example) for a full implementation of an extension that talks to a native application to get its process ID.

## Installing your Native Messaging App

Before your extension and your native app can communicate, the app will need to register an application manifest on the user's machine, and the extension will need to declare the `nativeMessaging` permission in its manifest. This library provides an `installManifest` utility to install a manifest for all of the user's currently installed browsers, which you can put somewhere in your app as either its own executable, or run via a flag on your main executable. For instance:

```ts
// If passed --install, install the manifest
const argv = yargs.argv
if (argv.install) {
  installManifest({
    name: "com.coder.wxnm_example",
    description: "Example of the wxnm library",
    path: path.resolve("./node/dist/wxnm-node-example"),
    chromeExtensionIds: [process.env.CHROME_EXTENSION_ID],
    webExtensionIds: ["wxnmexample@coder.com"],
  })
  process.exit(0)
}
```

See the example for more info.

## Usage

### Types

To get the full effectiveness of `wxnm`, you'll want to create some types that will be shared between your browser extension and your node application. They should look something like this:

```ts
import { NativeMessage } from "@coder/wxnm"

/**
 * Messages the extension will send, native app will recieve
 */
interface PingMessage extends NativeMessage {
  type: "PING"
  message: string
}

export type ExtensionMessages = PingMessage

/**
 * Messages the native app will send, extension will receive
 */
interface PongMessage extends NativeMessage {
  type: "PONG"
  message: string
}

interface ErrorMessage extends NativeMessage {
  type: "ERROR"
  error: string
}

export type NativeMessages = PongMessage | ErrorMessage
```

### Web Extension

In your web extension, you'll call `createExtensionMessenger` which will allow you to send messages, listen for messages, and listen for disconnects:

```ts
import { createExtensionMessenger } from "@coder/wxnm/extension"
import { ExtensionMessages, NativeMessages } from "../shared/types"

/**
 * Create an instance of ExtensionNativeMessenger
 */
const msger = createExtensionMessenger<ExtensionMessages, NativeMessages>("com.company.name_of_app")

/**
 * Handle each message type as it comes in from the app
 */
msger.onMessage((msg: NativeMessages) => {
  switch (msg.type) {
    case "PONG":
      console.log("Got PONG back!", msg.message)
    case "ERROR":
      console.error("Uh oh!", msg.error)
  }
})

/**
 * Alert to an error if we unexpectedly disconnect
 */
msger.onDisconnect((err?: Error) => {
  if (err) {
    console.error("Error with disconnect!", err)
  }
})

/**
 * Send a ping message to the native app
 */
msger.sendMessage({
  type: "PING",
  message: "Hello",
})
```

### Native Node Application

The node side looks very similar, with the generics flipped for `createNodeMessenger`:

```ts
import { createNodeMessenger } from "@coder/wxnm/node"
import { ExtensionMessages, NativeMessages } from "../shared/types"

/**
 * Create an instance of NodeNativeMessenger
 */
const msger = createNodeMessenger<NativeMessages, ExtensionMessages>()

/**
 * Handle ping messages and respond with a pong message
 */
msger.onMessage((msg: ExtensionMessages) => {
  switch (msg.type) {
    case "PING":
      msger.sendMessage({
        type: "PONG",
        data: { message: `You said: ${msg.data.message}` },
      })
  }
})

/**
 * Alert to an error if we unexpectedly disconnect
 */
msger.onDisconnect((err?: Error) => {
  if (err) {
    console.error("Error with disconnect!", err)
  }
  // Maybe run some cleanup code if you need to as well
})
```

## API

The `wxnm` API is **_not isomorphic_**, so you'll have two import paths depending on which environment you're in.

### @coder/wxnm/extension`

```ts
export class ExtensionNativeMessenger<ExtensionMessage, NodeMessage> {
  /**
   * Disconnect from the native app. This will kill the native app process and
   * trigger all onDisconnect listeners on both sides.
   */
  disconnect(): void
  /**
   * Add a listener for when you disconnect. Calls to `disconnect` will trigger
   * this without an error. Returns an unlistener function.
   */
  onDisconnect(listener: (err?: Error) => void): () => void
  /**
   * Add a listener for when you receive messages from the native app. Returns
   * an unlistener function.
   */
  onMessage(listener: (msg: NodeMessage) => void): () => void
  /**
   * Send a message to the native app. Must be JSON serializable.
   */
  sendMessage(msg: ExtensionMessage): void
}

/**
 * Creates an instance of ExtensionNativeMessenger
 */
export function createExtensionMessenger<ExtensionMessage, NodeMessage>()
```

### @coder/wxnm/extension

```ts
export class NodeNativeMessenger<NodeMessage, ExtensionMessage> {
  /**
   * Add a listener for when the extension disconnects. The app will terminate
   * after this runs. Returns an unlistener function.
   */
  onDisconnect(listener: (err?: Error) => void): () => void
  /**
   * Add a listener for when you receive messages from the extension. Returns
   * an unlistener function.
   */
  onMessage(listener: (msg: NodeMessage) => void): () => void
  /**
   * Send a message to the extension. Must be JSON serializable.
   */
  sendMessage(msg: ExtensionMessage): void
}

/**
 * Creates an instance of ExtensionNativeMessenger
 */
export function createExtensionMessenger<NodeMessage, ExtensionMessage>()
```

## Publishing

Because using this package relies on you importing submodules, you must run `npm publish` from within the `dist/` directory to avoid imports having to add `/dist/` to their paths. If you attempt to publish from the top level, the `prepublishOnly` script will fail.
