import * as yargs from "yargs"
import * as path from "path"
import * as process from "process"
import { createNodeMessenger, installManifest } from "@coder/wxnm/node"
import { NodeMessage, ExtensionMessage } from "types"

// If passed --install, install the manifests. Otherwise, run as usual.
const argv = yargs.argv
if (argv.install) {
  installManifest({
    name: "com.coder.wxnm_example",
    description: "Example of the wxnm library",
    path: path.resolve("./node/dist/wxnm-node-example"),
    chromeExtensionIds: ["hgfkibgdhmcdadeoolkhdpmfeoimnhno", "limabkknfdgahpkakdodmcjpehocoigi"],
    webExtensionIds: ["wxnmexample@coder.com"],
  })
  process.exit(0)
}

const messenger = createNodeMessenger<NodeMessage, ExtensionMessage>()

messenger.onMessage(msg => {
  if (msg.type === "REQUEST_PROCID") {
    messenger.sendMessage({
      type: "PROCID",
      id: process.pid,
    })
  }
})
