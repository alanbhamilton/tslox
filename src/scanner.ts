import Token from './token'
import { TokenType as TT, Literal } from './types'

type ScanError = [line: number, message: string]

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
        this.errors.push([this.line, `Unexpected character: ${c}`])
        break
    }
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
