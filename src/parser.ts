import { Token, TokenType as TT } from "./types"
import * as Expr from './expr'

// expression     → literal
//                | unary
//                | binary
//                | grouping ;

// literal        → NUMBER | STRING | "true" | "false" | "nil" ;
// grouping       → "(" expression ")" ;
// unary          → ( "-" | "!" ) expression ;
// binary         → expression operator expression ;
// ternary        → expression "?" expression ":" expression ;
// operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
//                | "+"  | "-"  | "*" | "/" ;


type ParserError = [token: Token, message: string]

class ParseError extends Error {}

export default class Parser {
  private tokens: Token[]
  private current = 0
  errors: ParserError[] = []

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Expr.Expr | null {
    try {
      return this.expression()
    } catch (error) {
      return null
    }
  }

  // ---------- Expression ----------

  private expression(): Expr.Expr {
    return this.equality()
  }

  private equality(): Expr.Expr {
    let expr: Expr.Expr = this.ternary()

    while (this.match(TT.BANG_EQUAL, TT.EQUAL_EQUAL)) {
      const operator: Token = this.previous()
      const right: Expr.Expr = this.comparison()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private ternary(): Expr.Expr {
    const expr: Expr.Expr = this.comparison()

    if (this.match(TT.QUESTION)) {
      const truthy: Expr.Expr = this.expression()
      this.consume(TT.COLON, "Expect ':' after truthy expression")
      const falsy: Expr.Expr = this.expression()
      return new Expr.Ternary(expr, truthy, falsy)
    }

    return expr
  }

  private comparison(): Expr.Expr {
    if  (this.match(TT.GREATER, TT.GREATER_EQUAL, TT.LESS, TT.LESS_EQUAL)) {
      const operator: Token = this.previous()
      this.term() // Discard operand
      throw this.error(operator, "Missing left operand.")
    }

    let expr: Expr.Expr = this.term()

    while (this.match(TT.GREATER, TT.GREATER_EQUAL, TT.LESS, TT.LESS_EQUAL)) {
      const operator: Token = this.previous()
      const right: Expr.Expr = this.term()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private term(): Expr.Expr {
    if (this.match(TT.PLUS)) {
      const operator: Token = this.previous()
      this.factor() // Discard operand
      throw this.error(operator, "Missing left operand.")
    }

    let expr: Expr.Expr = this.factor()

    while (this.match(TT.MINUS, TT.PLUS)) {
      const operator: Token = this.previous()
      const right: Expr.Expr = this.factor()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private factor(): Expr.Expr {
    if (this.match(TT.SLASH, TT.STAR)) {
      const operator: Token = this.previous()
      this.unary() // Discard operand
      throw this.error(operator, "Missing left operand.")
    }

    let expr: Expr.Expr = this.unary()

    while (this.match(TT.SLASH, TT.STAR)) {
      const operator: Token = this.previous()
      const right: Expr.Expr = this.unary()
      expr = new Expr.Binary(expr, operator, right)
    }

    return expr
  }

  private unary(): Expr.Expr {
    if (this.match(TT.BANG, TT.MINUS)) {
      const operator: Token = this.previous()
      const right: Expr.Expr = this.unary()
      return new Expr.Unary(operator, right)
    }

    return this.primary()
  }

  private primary(): Expr.Expr {
    if (this.match(TT.FALSE)) return new Expr.Literal(false)
    if (this.match(TT.TRUE)) return new Expr.Literal(true)
    if (this.match(TT.NIL)) return new Expr.Literal(null)

    if (this.match(TT.NUMBER, TT.STRING)) {
      const previous = this.previous()
      return new Expr.Literal(previous.literal)
    }

    if (this.match(TT.LEFT_PAREN)) {
      const expr: Expr.Expr = this.expression()
      this.consume(TT.RIGHT_PAREN, "Expect ')' after expression.")
      return new Expr.Grouping(expr)
    }

    throw this.error(this.peek(), "Expect expression.")
  }

  // ---------- Helper Methods ----------

  get hadError(): boolean {
    return this.errors.length > 0
  }

  private match(...types: TT[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  private consume(type: TT, message: string): Token {
    if (this.check(type)) return this.advance()

    throw this.error(this.peek(), message)
  }

  private check(type: TT): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TT.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private error(token: Token, message: string): ParseError {
    this.errors.push([token, message])
    return new ParseError()
  }

  private synchronize(): void {
    this.advance()

    while (!this.isAtEnd()) {
      if (this.previous().type === TT.SEMICOLON) return

      switch (this.peek().type) {
        case TT.CLASS:
        case TT.FUN:
        case TT.VAR:
        case TT.FOR:
        case TT.IF:
        case TT.WHILE:
        case TT.PRINT:
        case TT.RETURN:
          return
      }

      this.advance()
    }
  }
}
