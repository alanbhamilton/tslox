import * as Expr from './expr'
import * as Stmt from './stmt'
import Token from './token'

export default class AstPrinter implements Expr.IVisitor<string>, Stmt.IVisitor<string> {

  // ---------- Statement ----------

  public visitExpressionStmt(stmt: Stmt.Expression): string {
    return this.parenthesizeExprs('expr', stmt.expression)
  }

  public visitVarStmt(stmt: Stmt.Var): string {
    return this.parenthesizeTokenExpr('var', stmt.name, stmt.initializer)
  }

  public visitPrintStmt(stmt: Stmt.Print): string {
    return this.parenthesizeExprs('print', stmt.expression)
  }

  // ---------- Expression ----------

  public visitAssignExpr(expr: Expr.Assign): string {
    return this.parenthesizeTokenExpr('=', expr.name, expr.value)
  }

  public visitBinaryExpr(expr: Expr.Binary ): string {
    return this.parenthesizeExprs(expr.operator.lexeme, expr.left, expr.right)
  }

  public visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesizeExprs('group', expr.expression)
  }

  public visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value === null) return 'nil'
    return expr.value.toString()
  }

  public visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesizeExprs(expr.operator.lexeme, expr.right)
  }

  public visitTernaryExpr(expr: Expr.Ternary): string {
    return this.parenthesizeExprs('?:', expr.cond, expr.truthy, expr.falsy)
  }

  public visitVariableExpr(expr: Expr.Variable): string {
    return expr.name.lexeme
  }

  // ---------- Helpers ----------

  print(statement: Stmt.Stmt): string {
    return statement.accept(this)
  }

  public parenthesizeExprs(name: string, ...exprs: (Expr.Expr | null)[]) {
    let result = `(${name}`

    exprs.forEach(expr => {
      if (expr === null) {
        result += ' null'
      } else {
        result += ` ${expr.accept(this)}`
      }
    })
    result += ')'
    return result
  }

  public parenthesizeTokenExpr(name: string, token: Token, ...exprs: (Expr.Expr | null)[]) {
    let result = `(${name} ${token.lexeme}`

    exprs.forEach(expr => {
      if (expr === null) {
        result += ' null'
      } else {
        result += ` ${expr.accept(this)}`
      }
    })
    result += ')'
    return result
  }
}
