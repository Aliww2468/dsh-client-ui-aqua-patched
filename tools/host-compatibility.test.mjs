/** Exercise the legacy registration and modern no-registration paths in source and artifact.
 * Run with Node >= 22.13: node --test tools/host-compatibility.test.mjs
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { apply as builtApply } from '../lib/index.js'

const source = stripTypeScriptTypes(readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8'))
const { apply: sourceApply } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

for (const [name, apply] of [['artifact', builtApply], ['source', sourceApply]]) {
  test(`${name}: legacy DSH registers the card namespace with a callable schema`, () => {
    let registrations = 0
    const settings = {
      register(namespace, schema, options) {
        registrations++
        assert.equal(this, settings)
        assert.equal(namespace, 'aqua')
        assert.deepEqual(schema(undefined), {})
        assert.deepEqual(schema({ preserved: true }), { preserved: true })
        assert.equal(schema.toJSON().refs[0].type, 'object')
        assert.deepEqual(options, { base: {} })
      },
    }
    apply({ inject(deps, callback) {
      assert.deepEqual(deps, ['settings'])
      callback({ settings })
    } })
    assert.equal(registrations, 1)
  })

  test(`${name}: DSH 0.2 needs no legacy namespace or error log`, (t) => {
    const errors = t.mock.method(console, 'error', () => {})
    apply({ inject(_deps, callback) { callback({ settings: { configure() {} } }) } })
    assert.equal(errors.mock.callCount(), 0)
  })

  test(`${name}: a context without optional settings injection is supported`, () => {
    assert.doesNotThrow(() => apply({}))
  })
}
