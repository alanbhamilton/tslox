import * as Expr from './expr'
import * as Stmt from './stmt'
import { TokenType as TT, LiteralObj } from './types'
import Token from './token'
import { RuntimeError } from './errors'
import Lox from './lox'

export default class Interpreter implements Expr.IVisitor<LiteralObj>, Stmt.IVisitor<void> {
  interpret(statements: Stmt.Stmt[] ): void  {
    try {
      for (const statement of statements) {
        this.execute(statement)
      }
    } catch (error) {
      Lox.runtimeError(error as RuntimeError)
    }
  }

  // ---------- Statement ----------

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression)
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value: LiteralObj = this.evaluate(stmt.expression)
    console.log(this.stringify(value))
  }

  // ---------- Expression ----------

  public visitLiteralExpr(expr: Expr.Literal): LiteralObj  {
    return expr.value
  }

  public visitGroupingExpr(expr: Expr.Grouping): LiteralObj {
    return this.evaluate(expr.expression)
  }

  public visitUnaryExpr(expr: Expr.Unary): LiteralObj {
    const right: LiteralObj = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TT.BANG:
        return !this.isTruthy(right)
      case TT.MINUS:
        this.checkNumberOperand(expr.operator, right)
        return right !== null ? -right : null
    }

    // Unreachable.
    return null
  }

  visitBinaryExpr(expr: Expr.Binary): LiteralObj {
    const left: LiteralObj = this.evaluate(expr.left)
    const right: LiteralObj = this.evaluate(expr.right)

    switch (expr.operator.type) {
      case TT.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TT.EQUAL_EQUAL:
        return this.isEqual(left, right)
      case TT.GREATER:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) > (right as number)
      case TT.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) >= (right as number)
      case TT.LESS:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) < (right as number)
      case TT.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) <= (right as number)
      case TT.MINUS:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) - (right as number)
      case TT.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number)
        }

        if (typeof left === 'string' && typeof right === 'string') {
          return (left as string) + (right as string)
        }

        if (typeof left === 'string' && typeof right === 'number') {
          return (left as string) + right.toString()
        }

        if (typeof left === 'number' && typeof right === 'string') {
          return left.toString() + (right as string)
        }

        throw new RuntimeError(expr.operator, 'Operands must be two numbers or two strings.')
      case TT.SLASH:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) / (right as number)
      case TT.STAR:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) * (right as number)
    }

    // Unreachable.
    return null
  }

  visitTernaryExpr(expr: Expr.Ternary): LiteralObj {
    const cond: LiteralObj = this.evaluate(expr.cond)

    if (this.isTruthy(cond)) return this.evaluate(expr.truthy)
    return this.evaluate(expr.falsy)
  }

  // ---------- Helpers ----------

  private checkNumberOperand(operator: Token, operand: LiteralObj): void {
    if (typeof operand === 'number') return
    throw new RuntimeError(operator, 'Operand must be a number.')
  }

  private checkNumberOperands(operator: Token, left: LiteralObj, right: LiteralObj): void {
    if (typeof left === 'number' && typeof right === 'number') return

    throw new RuntimeError(operator, 'Operands must be numbers.')
  }

  private evaluate(expr: Expr.Expr) {
    return expr.accept(this)
  }

  private execute(stmt: Stmt.Stmt): void {
    stmt.accept(this)
  }

  private isTruthy(object: LiteralObj): boolean {
    if (object === null) return false
    if (typeof object === 'boolean') return object
    return true
  }

  private isEqual(a: LiteralObj, b: LiteralObj): boolean {
    // if (a === null && b === null) return true
    // if (a === null) return false

    return a === b
  }

  private stringify(object: LiteralObj): string {
    if (object == null) return 'nil'

    if (typeof object === 'number') {
      let text: string = object.toString()
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2)
      }
      return text
    }

    return object.toString()
  }
}
