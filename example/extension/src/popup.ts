import { createExtensionMessenger } from "@coder/wxnm/extension"

const msger = createExtensionMessenger("com.coder.wxnm_example")

// Show error message / disconnect on disconnect
msger.onDisconnect(err => {
  const errEl = document.getElementById("error")
  if (errEl) {
    errEl.innerHTML = err ? err.message : "Disconnected from native application"
    errEl.classList.remove("hidden")
  }
  console.error(err)
})
