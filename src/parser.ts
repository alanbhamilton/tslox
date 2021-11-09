import Lox from "./lox"
import { TokenType as TT, Nullable } from "./types"
import Token from "./token"
import * as Expr from './expr'
import * as Stmt from './stmt'
import { ParseError } from './errors'

// program        → declaration* EOF ;
//
// declaration    → varDecl
//                | statement ;
//
// varDecl        → "var" IDENTIFIER ( "=" expression )? ";" ;
//
// statement      → exprStmt
//                | printStmt
//                | block ;
//
// block          → "{" declaration* "}" ;


// exprStmt       → expression ";" ;
// printStmt      → "print" expression ";" ;


// expression     → literal
//                | unary
//                | binary
//                | grouping ;

// expression     → assignment ;
// assignment     → IDENTIFIER "=" assignment
//                | equality ;

// literal        → NUMBER | STRING | "true" | "false" | "nil" ;
// grouping       → "(" expression ")" ;
// unary          → ( "-" | "!" ) expression ;
// binary         → expression operator expression ;
// ternary        → expression "?" expression ":" expression ;
// operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
//                | "+"  | "-"  | "*" | "/" ;

// primary        → "true" | "false" | "nil"
//                | NUMBER | STRING
//                | "(" expression ")"
//                | IDENTIFIER ;

export default class Parser {
  private tokens: Token[]
  private current = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): Stmt.Stmt[] {
    const statements: Nullable<Stmt.Stmt>[] = []
    while (!this.isAtEnd()) {
      statements.push(this.declaration())
    }

    return statements.filter(s => s !== null) as Stmt.Stmt[]
  }

  // ---------- Statement ----------

  private statement(): Stmt.Stmt {
    if (this.match(TT.PRINT)) return this.printStatement()
    if (this.match(TT.LEFT_BRACE)) return new Stmt.Block(this.block())

    return this.expressionStatement()
  }

  private printStatement(): Stmt.Stmt {
    const value: Expr.Expr = this.expression()
    this.consume(TT.SEMICOLON, "Expect ';' after value.")
    return new Stmt.Print(value)
  }

  private varDeclaration(): Stmt.Stmt {
    const name: Token = this.consume(TT.IDENTIFIER, 'Expect variable name.')

    let initializer: Expr.Expr | null = null
    if (this.match(TT.EQUAL)) {
      initializer = this.expression()
    }

    this.consume(TT.SEMICOLON, "Expect ';' after variable declaration.")
    return new Stmt.Var(name, initializer)
  }

  private expressionStatement(): Stmt.Stmt {
    const expr: Expr.Expr = this.expression()
    this.consume(TT.SEMICOLON, "Expect ';' after expression.")
    return new Stmt.Expression(expr)
  }

  private block(): Nullable<Stmt.Stmt>[] {
    const statements: Nullable<Stmt.Stmt>[] = []

    while (!this.check(TT.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration())
    }

    this.consume(TT.RIGHT_BRACE, "Expect '}' after block.")
    return statements
  }

  // ---------- Expression ----------

  private expression(): Expr.Expr {
    return this.assignment()
  }

  private assignment(): Expr.Expr {
    const expr: Expr.Expr = this.equality()

    if (this.match(TT.EQUAL)) {
      const equals: Token = this.previous()
      const value: Expr.Expr = this.assignment()

      if (expr instanceof Expr.Variable) {
        const name: Token = expr.name
        return new Expr.Assign(name, value)
      }

      this.error(equals, 'Invalid assignment target.')
    }

    return expr
  }

  private declaration(): Stmt.Stmt | null {
    try {
      if (this.match(TT.VAR)) return this.varDeclaration()

      return this.statement()
    } catch (error) {
      this.synchronize()
      // return null
      console.error(error)
      throw error
    }
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

    if (this.match(TT.IDENTIFIER)) {
      return new Expr.Variable(this.previous())
    }

    if (this.match(TT.LEFT_PAREN)) {
      const expr: Expr.Expr = this.expression()
      this.consume(TT.RIGHT_PAREN, "Expect ')' after expression.")
      return new Expr.Grouping(expr)
    }

    throw this.error(this.peek(), "Expect expression.")
  }

  // ---------- Helper Methods ----------

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
    Lox.parserError(token, message)
    return new ParseError(token, message)
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
