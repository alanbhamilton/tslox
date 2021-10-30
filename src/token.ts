import { TokenType, tokenTypeNames, Literal } from './types'

export default class Token {
  type: TokenType
  lexeme: string
  literal: Literal
  line: number

  constructor(type: TokenType, lexeme: string, literal: Literal | null, line: number) {
      this.type = type
      this.lexeme = lexeme
      this.literal = literal
      this.line = line
  }

  public toString(): string {
    return tokenTypeNames.get(this.type) + " " + this.lexeme + " " + this.literal;
  }
}
