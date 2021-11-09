import { LiteralObj, Nullable } from './types'
import Token from './token'
import { RuntimeError } from './errors'

export default class Environment {
  enclosing: Nullable<Environment>
  private values: Map<string, LiteralObj> = new Map()

  constructor(enclosing: Nullable<Environment> = null) {
    this.enclosing = enclosing
  }

  get(name: Token): LiteralObj {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name)
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
  }

  assign(name: Token, value: LiteralObj): void  {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value)
      return
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value)
      return
    }

    throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`)
  }

  define(name: string, value: LiteralObj): void {
    this.values.set(name, value)
  }
}
