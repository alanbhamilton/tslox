import * as Expr from './expr'
import * as Stmt from './stmt'

export default class AstPrinter implements Expr.IVisitor<string>, Stmt.IVisitor<string> {
  print(statement: Stmt.Stmt): string {
    return statement.accept(this)
  }

  // ---------- Statement ----------

  public visitExpressionStmt(stmt: Stmt.Expression): string {
    return this.parenthesize('expr', stmt.expression)
  }

  public visitPrintStmt(stmt: Stmt.Print): string {
    return this.parenthesize('print', stmt.expression)
  }

  // ---------- Expression ----------

  public visitBinaryExpr(expr: Expr.Binary ): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  public visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize('group', expr.expression)
  }

  public visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value === null) return 'nil'
    return expr.value.toString()
  }

  public visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }

  public visitTernaryExpr(expr: Expr.Ternary): string {
    return this.parenthesize('?:', expr.cond, expr.truthy, expr.falsy)
  }

  public parenthesize(name: string, ...exprs: Expr.Expr[]) {
    let result = `(${name}`

    exprs.forEach(expr => result += ` ${expr.accept(this)}`)
    result += ')'
    return result
  }
}
