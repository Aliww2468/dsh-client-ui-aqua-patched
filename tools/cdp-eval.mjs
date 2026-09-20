/**
 * Generic CDP evaluator: loads a DSH web URL in headless Chrome and evaluates an
 * async expression in the page, returning its value plus any page exceptions.
 *
 * Usage: node cdp-eval.mjs <url> <settleMs> <asyncExpression>
 * The expression is wrapped in an async IIFE and awaited, so it may sleep
 * between DOM interactions.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const [url, settleArg, expressionArg] = process.argv.slice(2)
// An expression of the form @path reads the JS body from a file, which avoids
// shell-level quote mangling of selectors and string literals.
const expression = expressionArg?.startsWith('@')
  ? readFileSync(expressionArg.slice(1), 'utf8')
  : expressionArg
const settleMs = Number(settleArg ?? 12000)
if (!url || !expression) {
  console.log('RESULT: MISSING_ARGS')
  process.exit(2)
}

const userDataDir = mkdtempSync(join(tmpdir(), 'dsh-cdp-'))
const port = 9800 + Math.floor(Math.random() * 400)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--disable-background-networking', '--mute-audio',
  `--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`, 'about:blank',
], { stdio: 'ignore' })

const getJson = async (path) => (await fetch(`http://127.0.0.1:${port}${path}`)).json()

let ready = false
for (let i = 0; i < 120 && !ready; i += 1) {
  try { await getJson('/json/version'); ready = true } catch { await sleep(250) }
}
if (!ready) { console.log('RESULT: CDP_NOT_READY'); chrome.kill(); process.exit(2) }

let target
for (let i = 0; i < 60 && target === undefined; i += 1) {
  const list = await getJson('/json/list')
  const page = list.find((t) => t.type === 'page')
  if (page?.webSocketDebuggerUrl) target = page
  else await sleep(200)
}
if (target === undefined) { console.log('RESULT: NO_PAGE_TARGET'); chrome.kill(); process.exit(2) }

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = () => reject(new Error('ws failed')) })

let nextId = 1
const pending = new Map()
const exceptions = []
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id !== undefined && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
    return
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const d = message.params.exceptionDetails
    exceptions.push(String(d.exception?.description ?? d.text ?? '').split('\n')[0].slice(0, 240))
  }
}
const send = (method, params = {}) =>
  new Promise((resolve) => { const id = nextId++; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })

await send('Runtime.enable')
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(settleMs)

const wrapped = `(async () => { ${expression} })()`
const res = await send('Runtime.evaluate', { expression: wrapped, awaitPromise: true, returnByValue: true })
if (res.result?.exceptionDetails) {
  console.log('EVAL_ERROR:', String(res.result.exceptionDetails.exception?.description ?? '').split('\n')[0])
} else {
  console.log('VALUE:', typeof res.result?.result?.value === 'string' ? res.result.result.value : JSON.stringify(res.result?.result?.value))
}
console.log('EXCEPTIONS:', JSON.stringify(exceptions.slice(0, 6)))

ws.close()
chrome.kill()
process.exit(0)
