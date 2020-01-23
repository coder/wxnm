import path from "path"
import fs from "fs"
import { debug, isDir, isFile } from "./util"
import { ExtensionType, BROWSERS, IS_MAC, BrowserConfig } from "./constants"

interface ManifestInfo {
  /** Name of the application, usually formatted as com.company.appname */
  name: string
  /** Human readable description of the application */
  description: string
  /** Path to your native app executable */
  path: string
  /** List of Chrome-style extension IDs to allow the application to talk to, formatted without chrome-extension:// */
  chromeExtensionIds: string[]
  /** List of Mozilla-style extension IDs to allow the application to talk to, formatted app@company.com */
  webExtensionIds: string[]
}

function makeManifestContent(manifest: ManifestInfo, type: ExtensionType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: any = {
    name: manifest.name,
    description: manifest.description,
    path: manifest.path,
    type: "stdio",
  }

  if (type === ExtensionType.Chrome) {
    obj.allowed_origins = manifest.chromeExtensionIds.map(id => `chrome-extension://${id}/`)
  } else {
    obj.allowed_extensions = manifest.webExtensionIds
  }

  return `${JSON.stringify(obj, null, 2)}\n`
}

function detectInstalledBrowsers() {
  return Object.values(BROWSERS).filter(b => {
    // TODO: Detect browsers on windows
    const dir = IS_MAC ? b.hostDirMac : b.hostDirLinux
    if (!dir) {
      debug(`${b.name} - Not supported for this OS, excluding from installed browsers`)
      return false
    }
    if (!isDir(path.dirname(dir))) {
      debug(`${b.name} - Config directory does not exist, excluding from installed browsers`)
      return false
    }
    debug(`${b.name} - Detected installation`)
    return true
  })
}

function createBrowserManifest(b: BrowserConfig, manifest: ManifestInfo) {
  const dir = IS_MAC ? b.hostDirMac : b.hostDirLinux
  if (!dir) {
    debug(`${b.name} - Attempted to create manifest on unsupported OS`)
    return
  }

  if (!isDir(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
      mode: 0o777,
    })
    debug(`${b.name} - Created native messaging host directory at ${dir}`)
  }

  const manifestPath = path.join(dir, `${manifest.name}.json`)
  if (isFile(manifestPath)) {
    debug(`${b.name} - Manifest already exists at ${manifestPath}, overwriting...`)
  }

  const content = makeManifestContent(manifest, b.extensionType)
  fs.writeFileSync(manifestPath, content, {
    encoding: "utf8",
    flag: "w",
    mode: 0o644,
  })
  debug(`${b.name} - Created native messaging manifest file at ${manifestPath}`)
}

export function installManifest(manifest: ManifestInfo) {
  debug(manifest)
  // Get an array of the browsers currently installed
  const browsers = detectInstalledBrowsers()

  // Create a manifest file for each browser
  browsers.forEach(b => createBrowserManifest(b, manifest))
}
