import * as Expr from '../src/expr'
import { Token, TokenType } from '../src/types'
import AstPrinter from '../src/astPrinter'


const expression = new Expr.Binary(
  new Expr.Unary(
    new Token(TokenType.MINUS, '-', null, 1),
    new Expr.Literal(123)
  ),
  new Token(TokenType.STAR, '*', null, 1),
  new Expr.Grouping(
    new Expr.Literal(45.67))
  )

console.log(new AstPrinter().print(expression))
