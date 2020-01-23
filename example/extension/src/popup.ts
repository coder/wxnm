import { createExtensionMessenger } from "@coder/wxnm/extension"
import { ExtensionMessage, NodeMessage } from "types"

const msger = createExtensionMessenger<ExtensionMessage, NodeMessage>("com.coder.wxnm_example")

// Display PID when received
msger.onMessage(msg => {
  console.log("Got message!", msg)
  if (msg.type === "PROCID") {
    const pidEl = document.getElementById("pid")
    if (pidEl) {
      pidEl.innerHTML = msg.id.toString()
    }
  }
})

// Show error message / disconnect on disconnect
msger.onDisconnect(err => {
  const errEl = document.getElementById("error")
  if (errEl) {
    errEl.innerHTML = err ? err.message : "Disconnected from native application"
    errEl.classList.remove("hidden")
  }
  console.error(err)
})

// Request process ID
console.log("Sending message")
msger.sendMessage({ type: "REQUEST_PROCID" })
