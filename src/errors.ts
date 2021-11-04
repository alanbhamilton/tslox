import Token from './token'

class BaseError extends Error {
  token: Token

  constructor(token: Token, message: string) {
    super(message)
    this.token = token
  }
}

export class RuntimeError extends BaseError {}

export class ParseError extends BaseError {}
