# (W)eb E(x)tension (N)ative (M)essenger

`wxnm` is a library for providing TypeScript typed communication between your web extension and your native Node application using [Native Messaging](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging). It also provides some utilities for installing your native application's app manifest.

`wxnm` is meant for long-running applications and uses the [`runtime.connectNative`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connectNative) API under the hood. If your use case only requires infrequent, one-off messages to be sent, it's recommended you use [`runtime.sendNativeMessage`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendNativeMessage) directly.

## Installation

```bash
npm install @coder/wxnm
# or #
yarn add @coder/wxnm
```

## Setup

Before your extension and your app can communicate, the app will need to register an application manifest on the user's machine, and the extension will need to declare the `nativeMessaging` permission in its manifest. This library provides a utility for the former, and you can see an example of the latter in the [`example` directory](/example).

## Usage

### Types

To get the full effectiveness of `wxnm`, you'll want to create some types that will be shared between your browser extension and your node application. They should look something like this:

```ts
import { NativeMessage } from "@coder/wxnm"

// Messages the extension will send, native app will recieve
interface PingMessage extends NativeMessage {
  type: "PING"
  message: string
}

export type ExtensionMessages = PingMessage

// Messages the native app will send, extension will receive
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

In your web extension, you'll instantiate a new `ExtensionNativeMessenger` which will allow you to send and listen for messages:

```ts
import { createExtensionMessenger } from "@coder/wxnm/extension"
import { ExtensionMessages, NativeMessages } from "../shared/types"

const msger = createExtensionMessenger<ExtensionMessages, NativeMessages>("name_of_app")

msger.onMessage((msg: NativeMessages) => {
  switch (msg.type) {
    case "PONG":
      console.log("Got PONG back!", msg.message)
    case "ERROR":
      console.error("Uh oh!", msg.error)
  }
})

msger.sendMessage({
  type: "PING",
  message: "Hello",
})
```

### Native Node Application

The node side looks very familiar, with the generics flipped for the `NodeNativeMessenger` class:

```ts
import { createNodeMessenger } from "@coder/wxnm/node"
import { ExtensionMessages, NativeMessages } from "../shared/types"

const msger = createNodeMessenger<NativeMessages, ExtensionMessages>()

msger.onMessage((msg: ExtensionMessages) => {
  switch (msg.type) {
    case "PING":
      msger.sendMessage({
        type: "PONG",
        data: { message: `You said: ${msg.data.message}` },
      })
  }
})
```

## API

### `createExtensionMessenger(): ExtensionNativeMessenger`

Creates and connects an `ExtensionNativeMessenger` instance to a native application.

### `ExtensionNativeMessenger`

A class wrapper around [`runtime.connectNative`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connectNative)

#### `disconnect(): void`

Disconnects the messenger from the native app, which will fire `onDisconnect` listeners.

#### `onDisconnect(listener: (err?: Error) => void): () => void`

Add a disconnect listener that receives an `Error` object if available. Called if either the extension or app triggers the disconnect.

Returns a function that when called, removes the listener.

#### `onMessage(listener: (msg: Message) => void): () => void`

Add a message listener that receives a `Message` object whenever one is sent from the native app.

Returns a function that when called, removes the listener.

### `sendMessage(msg: Message): void`

Sends a message to the native application. Does not throw if the messenger is disconnected and you attempt to call `sendMessage`, it's just a no-op.

### `createNodeMessenger(): NodeNativeMessenger`

### `NodeNativeMessenger`

A class wrapper around `stdin` and `stdout` which is how the Native Messaging protocol communicates with the native app.

#### `onDisconnect(listener: (err?: Error) => void): () => void`

Add a disconnect listener that receives an `Error` object if available. Called if the extension triggers the disconnect (The app only disconnects if the process is exited.)

Returns a function that when called, removes the listener.

#### `onMessage(listener: (msg: Message) => void): () => void`

Add a message listener that receives a `Message` object whenever one is sent from the extension.

Returns a function that when called, removes the listener.

### Types

See [`src/types`](/src/types) for full list.

## Publishing

Because using this package relies on you importing submodules, you must run `npm publish` from within the `dist/` directory to avoid imports having to add `/dist/` to their paths. If you attempt to publish from the top level, the `prepublishOnly` script will fail.
