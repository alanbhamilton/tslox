import { LiteralObj } from './types'
import Token from './token'
import { RuntimeError } from './errors'

export default class Environment {
  private values: Map<string, LiteralObj> = new Map()

  get(name: Token): LiteralObj {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
  }

  assign(name: Token, value: LiteralObj): void  {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value)
      return
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
  }

  define(name: string, value: LiteralObj): void {
    this.values.set(name, value)
  }
}
