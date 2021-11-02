import * as Expr from './expr'

export default class AstPrinter implements Expr.IVisitor<String> {
  print(expr: Expr.Expr): string {
    return expr.accept(this)
  }

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

  public parenthesize(name: string, ...exprs: Expr.Expr[]) {
    let result = `(${name}`

    exprs.forEach(expr => result += ` ${expr.accept(this)}`)
    result += ')'
    return result
  }
}
