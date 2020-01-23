import fs from "fs"

export const debug = console.debug

const getStat = (path: string) => (fs.existsSync(path) ? fs.statSync(path) : null)

export const isDir = (dir: string) => {
  const stat = getStat(dir)
  return stat ? stat.isDirectory() : false
}

export const isFile = (file: string) => {
  const stat = getStat(file)
  return stat ? stat.isFile() : false
}
