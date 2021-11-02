import { readFileSync } from 'fs'
import readline from 'readline'
import Scanner from './scanner'
import Token from './token'
import Parser from './parser'
import * as Expr from './expr'
import AstPrinter from './astPrinter'
import { error, parserError } from './error'

export function runFile(filePath: string) {
  const hadError = run(readFileSync(filePath, 'utf-8'))

  if (hadError) process.exit(65)
}

export function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  process.stdout.write('> ')

  rl.on('line', line => {
    run(line)
    process.stdout.write('\n> ')
  })

  rl.on('close', () => console.log('bye ;)'))
}

export function run(source: string): boolean {
  const scanner = new Scanner(source)
  const tokens: Token[] = scanner.scanTokens()
  const parser: Parser = new Parser(tokens)
  const expression: Expr.Expr | null = parser.parse()

  if (scanner.hadError || parser.hadError || expression === null) {
    scanner.errors.forEach(err => error(...err))
    parser.errors.forEach(err => parserError(...err))
    return true
  }

  console.log(new AstPrinter().print(expression))
  return false
}
