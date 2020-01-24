# `wxnm` Example

![](https://i.imgur.com/64RZ2Os.gif)

An example that uses `wxnm` to have a native application report its process ID to the extension.

## Requirements

- Node 10+
- Yarn
- A [compatible browser](/#compatibility) installed

## Setup

1. Run `yarn` to install node dependencies
1. Run `yarn build:extension` to build the extension and native app
1. Install the extension in your browser of choice from `example/extension/dist`
   - If the browser you added it to is Chrome-based, export the extension ID as an environment variable
     ```sh
     > export CHROME_EXTENSION_ID="id"
     ```
1. Run `yarn build:node` to build the node app
1. Run the native messaging host installer by running the app with the install flag
   ```sh
   ./node/dist/wxnm-node-example --install
   ```
1. Open the extension popup, and see your process ID!

## Troubleshooting

If you run into error messages, see the [Chrome native messaging debugging help](https://developer.chrome.com/apps/nativeMessaging#native-messaging-debugging) or the [MDN native messaging troubleshooting section](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting).
