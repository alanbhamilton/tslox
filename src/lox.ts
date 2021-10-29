import {runFile, runPrompt} from './run'

let yargs: string[] = process.argv.slice(2)

const ERROR_EXIT = 64
let hadError = false

if (yargs.length > 1) {
  console.log('Usage: tslox [script]')
  process.exit(ERROR_EXIT)
} else if (yargs.length === 1) {
  try {
    runFile(yargs[0])
  } catch(error) {
    console.error(error)
    process.exit(ERROR_EXIT)
  }
} else {
  runPrompt()
}
