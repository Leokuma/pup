import { application } from "../meta.ts"
import { fatal } from "./result.ts"
import { Args } from "../deps.ts"

function printHeader() {
  console.log(application.name + " " + application.version)
  console.log(application.repo)
}

function printUsage() {
  console.log(`Usage: ${application.name} [OPTIONS...] [FILE]`)
}

function printFlags() {
  console.log(" -c\t--config\t\tUse specific configuration file")
  console.log("")
  console.log(" -h\t--help\t\tDisplay this help and exit")
  console.log(" -v\t--version\tOutput version information and exit")
  console.log("")
}

function checkArguments(args: Args): Args | null {
  let exit = false

  if (args.version) {
    exit = true
    if (!args.quiet) {
      printHeader()
    }
  }

  if (args.help) {
    exit = true
    if (!args.quiet) {
      printUsage()
      console.log("")
      printFlags()
    }
  }

  if (exit) {
    return null
  } else {
    if (!args._) {
      fatal("Missing argument")
    }

    return args
  }
}

export { checkArguments, printFlags, printHeader, printUsage }