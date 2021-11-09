import fs from 'fs'
import path from 'path'
import * as astStrings from './ast-strings'

const runFromCLI = require.main === module

const astDefinitions = {
  // Expressions
  Expr: {
    types: [
      'Assign   = name: Token, value: Expr',
      'Binary   = left: Expr, operator: Token, right: Expr',
      'Grouping = expression: Expr',
      'Literal  = value: LiteralObj',
      'Unary    = operator: Token, right: Expr',
      'Ternary  = cond: Expr, truthy: Expr, falsy: Expr',
      "Variable = name: Token"
    ],
    importStrings: [
      "import Token from './token'",
      "import { LiteralObj } from './types'"
    ]
  },
  // Statements
  Stmt: {
    types: [
      'Block      = statements: Nullable<Stmt>[]',
      'Expression = expression: Expr',
      'Print      = expression: Expr',
      'Var        = name: Token, initializer: Nullable<Expr>'
    ],
    importStrings: [
      "import Token from './token'",
      "import { Expr } from './expr'",
      "import { Nullable } from './types'"
    ]
  }
}

type Writer = fs.WriteStream | null

export default class ASTGenerator {
  outputDir: string

  constructor(outputDir: string) {
    this.outputDir = outputDir
  }

  public generate(): void {
    for (const [baseName, {types, importStrings}] of Object.entries(astDefinitions)) {
      const outputPath: string = path.resolve(this.outputDir, `${baseName.toLowerCase()}.ts`)
      const writer = fs.createWriteStream(outputPath).on('error', err => {
        console.error(err)
        process.exit(64)
      })
      writer.write(this.defineAST(baseName, types, importStrings))
      writer.end()
    }
  }

  private defineAST(baseName: string, types: string[], importStrings: string[]): string {
    return astStrings.defineMain
      .replace(/{{baseName}}/g, baseName)
      .replace(/{{defineImports}}/, this.defineImports(importStrings))
      .replace(/{{defineVisitor}}/, this.defineVisitor(baseName, types))
      .replace(/{{astClasses}}/, this.defineClasses(baseName, types))
  }

  private defineImports(importStrings: string[]): string {
    return importStrings.join('\n')
  }

  private defineVisitor(baseName: string, types: string[]): string {
    const visitors: string[] = types.map(type => {
      const className = type.split('=')[0].trim()
      return `  visit${className}${baseName}(${baseName.toLowerCase()}: ${className}): R`
    })

    return visitors.join('\n')
  }

  private defineClasses(baseName: string, types: string[]): string {
    const classes: string[] = types.map(type => {
      const className = type.split('=')[0].trim()
      const fields = type.split('=')[1].trim()
      return this.defineClass(baseName, className, fields)
    })

    return classes.join('\n')
  }

  private defineClass(baseName: string, className: string, fieldList: string): string {
    const fields = fieldList.split(', ').map(field => field.split(': '))

    return astStrings.defineClass
      .replace(/{{baseName}}/g, baseName)
      .replace(/{{className}}/g, className)
      .replace(/{{vars}}/, fields.map(field => `  public ${field.join(': ')}`).join('\n'))
      .replace(/{{params}}/, fields.map(field => field.join(': ')).join(', '))
      .replace(/{{assignments}}/, fields.map(([name, _type]) => `    this.${name} = ${name}`).join('\n'))
  }
}

// Run generator if called from CLI
if (runFromCLI) {
  let args: string[] = process.argv.slice(2)

  if (args.length !== 1) {
    console.error('Usage: generate-ast <output directory>')
    process.exit(64)
  }
   new ASTGenerator(args[0]).generate()
}
