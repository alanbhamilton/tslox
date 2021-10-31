import fs from 'fs'
import path from 'path'

let args: string[] = process.argv.slice(2)

if (args.length !== 1) {
  console.log('Usage: generate-ast <output directory>')
  process.exit(64)
}

const outputDir: string = args[0]


// FIXME This feels like it should be a class with common access to the file writer and helper method 'writeln'
defineAst(outputDir, 'Expr', [
  'Binary   : left Expr, operator Token, right Expr',
  'Grouping : expression Expr',
  'Literal  : value LiteralObj',
  'Unary    : operator Token, right Expr'
])

function defineAst(outputDir: string, baseName: string, types: string[]): void {
  const outputPath: string = path.resolve(outputDir, `${baseName.toLowerCase()}.ts`)
  const writer = fs.createWriteStream(outputPath)
    .on('error', function (err) {
      console.log(err)
      process.exit(64)
    })

  // Extract unique types
  let typesToImport = Array.from(types.reduce((acc: Set<string>, type) => {
    type.split(':')[1].trim()
      .split(', ').map(t => t.split(' ')[1])
      .forEach(t => {
        if (t !== baseName) acc.add(t)
      })
    return acc
  }, new Set<string>()))

  writer.write(`import { ${typesToImport.join(', ')} } from './types'`)
  writer.write('\n')
  writer.write(`class ${baseName} {}`)
  writer.write('\n\n')
  writer.write(`namespace ${baseName} {`)
  writer.write('\n')

  // The AST classes.
  types.forEach(type => {
    const className = type.split(':')[0].trim()
    const fields = type.split(':')[1].trim()
    defineType(writer, baseName, className, fields)
  })

  writer.write('}')
  writer.end()
}

function defineType(writer: fs.WriteStream, baseName: string, className: string, fieldList: string): void {
  const fields = fieldList.split(', ').map(field => field.split(' '))

  writeln(`  export class ${className} {`)
  fields.forEach(field => {
    writeln(`    public ${field.join(': ')}`)
  })
  writeln()
  writeln(`    constructor(${fields.map(f => f.join(': ')).join(', ')}) {`)
  fields.forEach(([name, _type]) => {
    writeln(`      this.${name} = ${name}`)
  })
  writeln('    }')
  writeln('  }')
  writeln()

  function writeln(text = ''): void {
    writer.write(text + '\n')
  }
}
