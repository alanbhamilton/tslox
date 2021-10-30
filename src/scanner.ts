import Token from './token'
import { TokenType as TT, Literal } from './types'

type ScanError = [line: number, message: string]

const keywords: Map<string, TT> = new Map([
  ['and',    TT.AND],
  ['class',  TT.CLASS],
  ['else',   TT.ELSE],
  ['false',  TT.FALSE],
  ['for',    TT.FOR],
  ['fun',    TT.FUN],
  ['if',     TT.IF],
  ['nil',    TT.NIL],
  ['or',     TT.OR],
  ['print',  TT.PRINT],
  ['return', TT.RETURN],
  ['super',  TT.SUPER],
  ['this',   TT.THIS],
  ['true',   TT.TRUE],
  ['var',    TT.VAR],
  ['while',  TT.WHILE]
])

export default class Scanner {
  source: string
  tokens: Token[] = []
  errors: ScanError[] = []
  start: number = 0
  current: number = 0
  line: number = 1

  constructor(source: string) {
    this.source = source
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TT.EOF, '', null, this.line))
    return this.tokens
  }

  private scanToken() {
    const c = this.advance()

    switch (c) {
      case '(': this.addToken(TT.LEFT_PAREN); break
      case ')': this.addToken(TT.RIGHT_PAREN); break
      case '{': this.addToken(TT.LEFT_BRACE); break
      case '}': this.addToken(TT.RIGHT_BRACE); break
      case ',': this.addToken(TT.COMMA); break
      case '.': this.addToken(TT.DOT); break
      case '-': this.addToken(TT.MINUS); break
      case '+': this.addToken(TT.PLUS); break
      case ';': this.addToken(TT.SEMICOLON); break
      case '*': this.addToken(TT.STAR); break
      case '!':
        this.addToken(this.match('=') ? TT.BANG_EQUAL : TT.BANG)
        break
      case '=':
        this.addToken(this.match('=') ? TT.EQUAL_EQUAL : TT.EQUAL)
        break
      case '<':
        this.addToken(this.match('=') ? TT.LESS_EQUAL : TT.LESS)
        break
      case '>':
        this.addToken(this.match('=') ? TT.GREATER_EQUAL : TT.GREATER)
        break
      // Comments or forward slash
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else if (this.match('*')) {
          this.blockComment()
        } else {
          this.addToken(TT.SLASH)
        }
        break
      // Whitespace
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break
      // Newlines
      case '\n': this.line++; break
      // String Literals
      case '"': this.string(); break
      default:
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlpha(c)) {
          this.identifier()
        } else {
          this.errors.push([this.line, `Unexpected character: ${c}`])
        }
        break
    }
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance()

    const text: string = this.source.substring(this.start, this.current)
    let type: TT | undefined = keywords.get(text)
    if (type === undefined) type = TT.IDENTIFIER
    this.addToken(type)
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance()

    // Look for a fractional part.
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance()

      while (this.isDigit(this.peek())) this.advance()
    }

    this.addTokenLiteral(
      TT.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    )
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++
      this.advance()
    }

    if (this.isAtEnd()) {
      // Lox.error(line, "Unterminated string.");
      this.errors.push([this.line, 'Unterminated string.'])
      return
    }

    // The closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value: string = this.source.substring(this.start + 1, this.current - 1)
    this.addTokenLiteral(TT.STRING, value)
  }

  private blockComment() {
    let blockOpeningLines = [this.line]

    while (blockOpeningLines.length > 0 && !this.isAtEnd()) {
      const c = this.advance()
      switch (c) {
        case '\n': this.line++; break
        case '/':
          if (this.match('*')) blockOpeningLines.push(this.line)
          break
        case '*':
          if (this.match('/')) blockOpeningLines.pop()
          break
      }
    }

    if (this.isAtEnd() && blockOpeningLines.length > 0) {
      blockOpeningLines.forEach(line => this.errors.push([line, 'Unterminated block quote.']))
      return
    }
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false
    if (this.source.charAt(this.current) != expected) return false;

    this.current++
    return true
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0'
    return this.source.charAt(this.current + 1);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') ||
           (c >= 'A' && c <= 'Z') ||
            c === '_'
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c)
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9'
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  private advance(): string {
    return this.source.charAt(this.current++)
  }

  private addToken(type: TT) {
    this.addTokenLiteral(type, null)
  }

  private addTokenLiteral(type: TT, literal: Literal) {
    const text: string = this.source.substring(this.start, this.current)
    this.tokens.push(new Token(type, text, literal, this.line))
  }
}
