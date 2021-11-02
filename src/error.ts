import { TokenType } from "./types";
import Token from './token'

export function error(line: number, message: string) {
  report(line, '', message)
}

export function report(line: number, where: string, message: string) {
  console.error(`[line ${line}] Error${where}: ${message}`)
}

export function parserError(token: Token, message: string): void {
  if (token.type == TokenType.EOF) {
    report(token.line, ' at end', message)
  } else {
    report(token.line, ` at '${token.lexeme}'`, message)
  }
}
