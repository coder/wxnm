import { createNodeMessenger } from "@coder/wxnm/node"
import { NodeMessage, ExtensionMessage } from "types"

const msger = createNodeMessenger<NodeMessage, ExtensionMessage>()
