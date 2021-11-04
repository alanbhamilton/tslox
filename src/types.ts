export const enum TokenType {
  // Single-character tokens.
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,
  QUESTION, COLON,

  // One or two character tokens.
  BANG, BANG_EQUAL,
  EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,

  // Literals.
  IDENTIFIER, STRING, NUMBER,

  // Keywords.
  AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
  PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

  EOF
}

export const tokenTypeNames: Map<TokenType, string> = new Map([
  [TokenType.LEFT_PAREN, 'LeftParen'],
  [TokenType.RIGHT_PAREN, 'RightParen'],
  [TokenType.LEFT_BRACE, 'LeftBrace'],
  [TokenType.RIGHT_BRACE, 'RightBrace'],
  [TokenType.COMMA, 'Comma'],
  [TokenType.DOT, 'Dot'],
  [TokenType.MINUS, 'Minus'],
  [TokenType.PLUS, 'Plus'],
  [TokenType.SEMICOLON, 'Semicolon'],
  [TokenType.SLASH, 'Slash'],
  [TokenType.STAR, 'Star'],
  [TokenType.QUESTION, 'Question'],
  [TokenType.COLON, 'Colon'],

  [TokenType.BANG, 'Bang'],
  [TokenType.BANG_EQUAL, 'BangEqual'],
  [TokenType.EQUAL, 'Equal'],
  [TokenType.EQUAL_EQUAL, 'EqualEqual'],
  [TokenType.GREATER, 'Greater'],
  [TokenType.GREATER_EQUAL, 'GreaterEqual'],
  [TokenType.LESS, 'Less'],
  [TokenType.LESS_EQUAL, 'LessEqual'],

  [TokenType.IDENTIFIER, 'Identifier'],
  [TokenType.STRING, 'String'],
  [TokenType.NUMBER, 'Number'],

  [TokenType.AND, 'And'],
  [TokenType.CLASS, 'Class'],
  [TokenType.ELSE, 'Else'],
  [TokenType.FALSE, 'False'],
  [TokenType.FUN, 'Fun'],
  [TokenType.FOR, 'For'],
  [TokenType.IF, 'If'],
  [TokenType.NIL, 'Nil'],
  [TokenType.OR, 'Or'],
  [TokenType.PRINT, 'Print'],
  [TokenType.RETURN, 'Return'],
  [TokenType.SUPER, 'Super'],
  [TokenType.THIS, 'This'],
  [TokenType.TRUE, 'True'],
  [TokenType.VAR, 'Var'],
  [TokenType.WHILE, 'While'],

  [TokenType.EOF, 'EndOfFile']
])

export type LiteralObj = Object | null
