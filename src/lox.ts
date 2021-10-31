import {runFile, runPrompt} from './run'

let args: string[] = process.argv.slice(2)

const ERROR_EXIT = 64

if (args.length > 1) {
  console.log('Usage: tslox [script]')
  process.exit(ERROR_EXIT)
} else if (args.length === 1) {
  try {
    runFile(args[0])
  } catch(error) {
    console.error(error)
    process.exit(ERROR_EXIT)
  }
} else {
  runPrompt()
}
