import { TokenType } from "./types";
import Token from './token'

export function error(line: number, column: number, message: string) {
  report(line, column, '', message)
}

export function report(line: number, column: number, where: string, message: string) {
  console.error(`[${line}:${column}] Error${where}: ${message}`)
}

export function parserError(token: Token, message: string): void {
  if (token.type == TokenType.EOF) {
    report(token.line, token.column, ' at end', message)
  } else {
    report(token.line, token.column, ` at '${token.lexeme}'`, message)
  }
}
