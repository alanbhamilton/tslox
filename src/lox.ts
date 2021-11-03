import { readFileSync } from 'fs'
import readline from 'readline'
import Scanner from './scanner'
import Token from './token'
import Parser from './parser'
import Interpreter from './interpreter'
import * as Expr from './expr'
import AstPrinter from './astPrinter'
import { TokenType } from "./types"
import RuntimeError from "./runtimeError"

const runFromCLI = require.main === module

export default class Lox {
  static hadParseError = false
  static hadRuntimeError = false

  public static main(args: string[]) {
    if (args.length > 1) {
      console.log('Usage: tslox [script]')
      process.exit(54)
    } else if (args.length === 1) {
      try {
        Lox.runFile(args[0])
      } catch(error) {
        console.error(error)
        process.exit(64)
      }
    } else {
      Lox.runPrompt()
    }
  }

  private static runFile(filePath: string) {
    Lox.run(readFileSync(filePath, 'utf-8'))

    if (Lox.hadParseError) process.exit(65)
    if (Lox.hadRuntimeError) process.exit(70)
  }

  private static runPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    process.stdout.write('> ')

    rl.on('line', line => {
      Lox.run(line)
      process.stdout.write('\n> ')
    })

    rl.on('close', () => console.log('bye ;)'))
  }

  static run(source: string): void {
    const scanner = new Scanner(source)
    const tokens: Token[] = scanner.scanTokens()
    const parser: Parser = new Parser(tokens)
    const expression: Expr.Expr | null = parser.parse()
    const interpreter: Interpreter = new Interpreter()

    if (Lox.hadParseError || expression === null) return

    interpreter.interpret(expression)

    if (Lox.hadRuntimeError) return

    console.log(new AstPrinter().print(expression))
  }

  static error(line: number, column: number, message: string) {
    Lox.report(line, column, '', message)
  }

  private static report(line: number, column: number, where: string, message: string) {
    Lox.hadParseError = true
    console.error(`[${line}:${column}] Error${where}: ${message}`)
  }

  static parserError(token: Token, message: string): void {
    if (token.type == TokenType.EOF) {
      Lox.report(token.line, token.column, ' at end', message)
    } else {
      Lox.report(token.line, token.column, ` at '${token.lexeme}'`, message)
    }
  }

  static runtimeError(error: RuntimeError): void {
    Lox.hadRuntimeError = true
    console.error(`[${error.token.line}:${error.token.column}] Runtime Error: ${error.message}`)
  }
}

if (runFromCLI) {
  Lox.main(process.argv.slice(2))
}
