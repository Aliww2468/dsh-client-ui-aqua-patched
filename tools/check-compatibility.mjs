/** Run the shipped DSH validator, without installing plugins or granting exemptions.
 * Usage: node tools/check-compatibility.mjs /path/to/dsh-install-root
 * The root must resolve @deepseek-ai/dsh-app-boot through its node_modules.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const installRoot = process.argv[2]
if (!installRoot) throw new Error('Usage: node tools/check-compatibility.mjs <dsh-install-root>')
const requireHost = createRequire(resolve(installRoot, 'package.json'))
const { evaluatePluginCompatibility, getDshRuntimeVersion } = await import(
  pathToFileURL(requireHost.resolve('@deepseek-ai/dsh-app-boot')).href
)
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
for (const [runtime, allowed] of [
  ['0.1.2-rc.1', true],
  ['0.2.1-rc.3', true],
  ['0.1.1', false],
  ['0.2.0', false],
  ['0.2.1-rc.4', false],
  ['0.3.0', false],
]) {
  const issue = evaluatePluginCompatibility(manifest, {}, runtime)
  assert.equal(issue === undefined, allowed, `${runtime}: unexpected compatibility result`)
  if (issue) assert.equal(issue.exempted, false)
  console.log(`${runtime}: ${allowed ? 'accepted' : 'rejected'} (no exemption)`)
}
assert.equal(evaluatePluginCompatibility(manifest, {}), undefined, 'Installed host must accept this build')
console.log(`PASS: ${manifest.name}@${manifest.version} on DSH ${getDshRuntimeVersion()}`)
