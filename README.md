# (W)eb E(x)tension (N)ative (M)essaging

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
  data: {
    message: string
  }
}

export type ExtensionMessages = PingMessage

// Messages the native app will send, extension will receive
interface PongMessage extends NativeMessage {
  type: "PONG"
  data: {
    message: string
  }
}

interface ErrorMessage extends NativeMessage {
  type: "ERROR"
  data: {
    error: string  
  }
}

export type NativeMessages = PongMessage | ErrorMessage
```

### Web Extension

In your web extension, you'll instantiate a new `ExtensionNativeMessager<ExtensionMessages, NativeMessages>` which will allow you to send and listen for messages:

```ts
import { ExtensionNativeMessager } from "@coder/wxnm"
import { ExtensionMessages, NativeMessages } from "../shared/types"

const msger = new ExtensionNativeMessager<ExtensionMessages, NativeMessages>("name_of_app")

msger.onMessage.addListener(msg => {
  switch (msg.type) {
    case "PONG":
      console.log("Got PONG back!", msg.data.message)
    case "ERROR":
      console.error("Uh oh!", msg.data.error)
  }
})

msger.sendMessage({
  type: "PING",
  data: { message: "Hello" },
})
```

### Native Node Application

The node side looks very familiar, with the generics flipped for the `NodeNativeMessager<NativeMessages, ExtensionMessages>` class:

```ts
import { NodeNativeMessager } from "@coder/wxnm"
import { ExtensionMessages, NativeMessages } from "../shared/types"

const msger = new NodeNativeMessager<NativeMessages, ExtensionMessages>()

msger.onMessage.addListener(msg => {
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

### ExtensionNativeMessager

A class wrapper around [`runtime.connectNative`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connectNative)

### NodeNativeMessager

A class wrapper around `stdin` and `stdout` which is how the Native Messaging protocol communicates with the native app.

### Types

See [`src/types`]() for full list.
