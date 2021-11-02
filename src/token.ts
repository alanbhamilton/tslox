import { TokenType, tokenTypeNames, LiteralObj } from './types'

export default class Token {
  type: TokenType
  lexeme: string
  literal: LiteralObj
  line: number
  column: number

  constructor(type: TokenType, lexeme: string, literal: LiteralObj | null, line: number, column: number) {
      this.type = type
      this.lexeme = lexeme
      this.literal = literal
      this.line = line
      this.column = column
  }

  public toString(verbose = false): string {
    let s = `${tokenTypeNames.get(this.type)} ${this.lexeme} ${this.literal}`
    if (verbose) s +=  ` [${this.line}:${this.column}]`
    return s
  }
}
