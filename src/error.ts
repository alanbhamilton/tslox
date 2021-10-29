export function error(line: number, message: string) {
  report(line, '', message)
}

export function report(line: number, where: string, message: string) {
  console.error(`[line ${line}] Error${where}: ${message}`)
}
