import os from "os"
import path from "path"

export enum ExtensionType {
  Web = "webExtension",
  Chrome = "chromeExtension",
}

export const IS_MAC = os.platform() === "darwin"
export const IS_WIN = os.platform() === "win32"

export const HOME_DIR = os.homedir()
const CONFIG_DIR_MAC = path.join(HOME_DIR, "Library", "Application Support")
const CONFIG_DIR_WIN = path.join(HOME_DIR, "AppData", "Roaming")
const CONFIG_DIR_LINUX = path.join(HOME_DIR, ".config")
export const CONFIG_DIR = IS_MAC ? CONFIG_DIR_MAC : IS_WIN ? CONFIG_DIR_WIN : CONFIG_DIR_LINUX

export interface BrowserConfig {
  name: string
  hostDirMac: string | false
  hostDirLinux: string | false
  registry: string | false
  extensionType: ExtensionType
}

const NMH = "NativeMessagingHosts"
const makeRegistry = (s: string) => `HKEY_CURRENT_USER/SOFTWARE/${s}/NativeMessagingHosts`
const makeMacHostDir = (s: string) => `${CONFIG_DIR_MAC}/${s}/${NMH}`

export const BROWSERS: { [browser: string]: BrowserConfig } = {
  // Chrome(s)
  chrome: {
    name: "Chrome",
    hostDirMac: makeMacHostDir("Google/Chrome"),
    hostDirLinux: `${CONFIG_DIR_LINUX}/google-chrome/${NMH}`,
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
  chromebeta: {
    name: "Chrome (Beta)",
    hostDirMac: false,
    hostDirLinux: `${CONFIG_DIR_LINUX}/google-chrome-beta/${NMH}`,
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
  chromecanary: {
    name: "Chrome (Canary)",
    hostDirMac: makeMacHostDir("Google/Chrome Canary"),
    hostDirLinux: false,
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
  chromium: {
    name: "Chromium",
    hostDirMac: makeMacHostDir("Chromium"),
    hostDirLinux: `${CONFIG_DIR_LINUX}/chromium/${NMH}`,
    registry: false,
    extensionType: ExtensionType.Chrome,
  },
  // Firefox(es)
  firefox: {
    name: "Firefox",
    hostDirMac: makeMacHostDir("Mozilla"),
    hostDirLinux: `${HOME_DIR}/.mozilla/native-messaging-hosts`,
    registry: makeRegistry("Mozilla"),
    extensionType: ExtensionType.Web,
  },
  waterfox: {
    name: "Waterfox",
    hostDirMac: makeMacHostDir("Waterfox"),
    hostDirLinux: `${HOME_DIR}/.waterfox/native-messaging-hosts`,
    registry: makeRegistry("Waterfox"),
    extensionType: ExtensionType.Web,
  },
  // Alt browsers
  brave: {
    name: "Brave",
    hostDirMac: makeMacHostDir("BraveSoftware/Brave-Browser"),
    hostDirLinux: `${CONFIG_DIR_LINUX}/BraveSoftware/Brave-Browser/${NMH}`,
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
  opera: {
    name: "Opera",
    hostDirMac: makeMacHostDir("Google/Chrome"),
    hostDirLinux: false, // TODO: Find out what this should be
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
  vivaldi: {
    name: "Vivaldi",
    hostDirMac: makeMacHostDir("Vivaldi"),
    hostDirLinux: `${CONFIG_DIR_LINUX}/vivaldi/${NMH}`,
    registry: makeRegistry("Google/Chrome"),
    extensionType: ExtensionType.Chrome,
  },
}
