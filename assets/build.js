// See https://hexdocs.pm/phoenix/asset_management.html#esbuild-plugins
const esbuild = require('esbuild')
const esbuildSvelte = require('esbuild-svelte')
const sveltePreprocess = require('svelte-preprocess')

const args = process.argv.slice(2)
const watch = args.includes('--watch')
const deploy = args.includes('--deploy')

let opts = {
  entryPoints: ['src/app.js'],
  bundle: true,
  target: 'es2017',
  outdir: '../priv/static/assets',
  logLevel: 'info',
  loader: {},
  plugins: [
    esbuildSvelte({
      preprocess: sveltePreprocess(),
    }),
  ]
}

if (watch) {
  opts = {
    ...opts,
    watch,
    sourcemap: 'inline'
  }
}

if (deploy) {
  opts = {
    ...opts,
    minify: true
  }
}

const promise = esbuild.build(opts)

if (watch) {
  promise.then(_result => {
    process.stdin.on('close', () => {
      process.exit(0)
    })

    process.stdin.resume()
  })
}