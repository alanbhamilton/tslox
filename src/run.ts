import { readFileSync } from 'fs'
import readline from 'readline'
import Scanner from './scanner'
import Token from './token'
import { error } from './error'
import AstPrinter from './astPrinter'

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

  if (scanner.errors.length > 0) {
    scanner.errors.forEach(err => error(...err))
    return true
  }
  tokens.forEach(token => console.log(token.toString()))
  return false
}
