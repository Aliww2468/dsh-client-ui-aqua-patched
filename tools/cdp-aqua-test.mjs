/**
 * Headless end-to-end probe for the DSH Aqua theme layer.
 * Drives Google Chrome over the DevTools Protocol with Node's built-in fetch +
 * WebSocket (no npm dependencies) and asserts that the Aqua client plugin
 * actually applied its visual layer to the live web GUI.
 *
 * Usage: node cdp-aqua-test.mjs <url-with-token> [settleMs]
 * Prints DOM:/EXCEPTIONS:/CONSOLE_ERRORS:/LOG_ERRORS:/RESULT: lines.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const url = process.argv[2]
const settleMs = Number(process.argv[3] ?? 15000)
if (!url) {
  console.log('RESULT: MISSING_URL')
  process.exit(2)
}

const userDataDir = mkdtempSync(join(tmpdir(), 'aqua-cdp-'))
const port = 9400 + Math.floor(Math.random() * 400)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--disable-background-networking',
  '--mute-audio',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank',
], { stdio: 'ignore' })

const getJson = async (path) => (await fetch(`http://127.0.0.1:${port}${path}`)).json()

let ready = false
for (let i = 0; i < 120 && !ready; i += 1) {
  try {
    await getJson('/json/version')
    ready = true
  } catch {
    await sleep(250)
  }
}
if (!ready) {
  console.log('RESULT: CDP_NOT_READY')
  chrome.kill()
  process.exit(2)
}

let target
for (let i = 0; i < 60 && target === undefined; i += 1) {
  const list = await getJson('/json/list')
  const page = list.find((t) => t.type === 'page')
  if (page?.webSocketDebuggerUrl) target = page
  else await sleep(200)
}
if (target === undefined) {
  console.log('RESULT: NO_PAGE_TARGET')
  chrome.kill()
  process.exit(2)
}

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.onopen = resolve
  ws.onerror = () => reject(new Error('cdp websocket failed'))
})

let nextId = 1
const pending = new Map()
const exceptions = []
const consoleErrors = []
const logErrors = []
const firstLine = (value) => String(value ?? '').split('\n')[0].slice(0, 300)

ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  if (message.id !== undefined && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
    return
  }
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params.exceptionDetails
    exceptions.push(firstLine(details.exception?.description ?? details.text))
  }
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
    consoleErrors.push(firstLine(message.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')))
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    logErrors.push(firstLine(`${message.params.entry.source}: ${message.params.entry.text}`))
  }
}

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })

await send('Runtime.enable')
await send('Log.enable')
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(settleMs)

const probe = `JSON.stringify({
  title: document.title,
  ambient: document.querySelector('[data-dsh-aqua-ambient]') !== null,
  fluidCanvas: document.querySelector('[data-dsh-aqua-fluid-canvas]') !== null,
  wallpaperLayer: document.querySelector('[data-dsh-aqua-wallpaper-layer]') !== null,
  aquaStyleTags: [...document.querySelectorAll('style')].filter((s) => (s.textContent || '').includes('data-dsh-aqua')).length,
  lsEnabled: localStorage.getItem('dsh.ui-aqua.enabled'),
  bodyChildren: document.body === null ? -1 : document.body.children.length
})`

const result = await send('Runtime.evaluate', { expression: probe, returnByValue: true })
const value = result.result?.result?.value ?? ''
console.log('DOM:', value)
console.log('EXCEPTIONS:', JSON.stringify(exceptions.slice(0, 8)))
console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors.slice(0, 8)))
console.log('LOG_ERRORS:', JSON.stringify(logErrors.slice(0, 8)))

const applied = value.includes('"ambient":true')
const broke = exceptions.length > 0 || consoleErrors.length > 0
console.log('RESULT:', applied && !broke ? 'PASS' : applied ? 'PASS_WITH_ERRORS' : 'FAIL')

ws.close()
chrome.kill()
process.exit(0)
