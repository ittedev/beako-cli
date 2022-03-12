// Copyright 2022 itte.dev. All rights reserved. MIT license.
import type { BuildOptions } from 'https://deno.land/x/esbuild@v0.14.11/mod.js'
import { build, stop } from 'https://deno.land/x/esbuild@v0.14.11/mod.js'
import { denoModulePlugin } from './deno_module_plugin.ts'

const [command, ...args] = Deno.args
const options = args.filter(arg => arg.startsWith('--'))
const files = args.filter(arg => !arg.startsWith('--'))

const pairs = [
  { short: 'o', long: 'outfile', hasValue: true }
]

for (let i = 0; i < files.length; i++) {
  const pair = pairs.find(pair => '-' + pair.short === files[i])
  if (pair) {
    const [, name] = files.splice(i, pair.hasValue ? 2 : 1)
    options.push(`--${pair.long}${pair.hasValue ? '=' + name : ''}`)
  }
}

switch (command) {
  case '-v':
  case '--version': {
    console.info('Beako CLI 0.1.0')
    break
  }

  case 'build': {
    const outfile = options.find(arg => arg.startsWith('--outfile='))?.slice(10) || ''
    const outdir = options.find(arg => arg.startsWith('--outdir='))?.slice(9) || './dist'
    const watch = options.some(arg => arg === '--watch')
    const minify = !options.some(arg => arg === '--no-minify')
    const splitting = !options.some(arg => arg === '--no-splitting')
    const allowOverwrite = !options.some(arg => arg === '--no-allow-overwrite')

    const esbuildOptions: BuildOptions = {
      entryPoints: files,
      bundle: true,
      format: 'esm',
      splitting,
      minify,
      allowOverwrite,
      plugins: [denoModulePlugin],
      watch: watch ? {
        // deno-lint-ignore no-explicit-any
        onRebuild(error: any, result: any) {
          if (error) console.error('watch build failed:', error)
          else console.info('watch build succeeded:', result)
        }
      } : false
    }

    if (outfile && files.length === 1) {
      esbuildOptions.outfile = outfile
      esbuildOptions.splitting = false
    } else {
      esbuildOptions.outdir = outdir
    }

    build(esbuildOptions).then(() => !watch && stop())

    break
  }

  default: {
    console.info('Command', command || '', 'is not found')
  }
}
