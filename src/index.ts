/**
 * Aqua theme-layer plugin, node half.
 *
 * Upstream this half is an empty `apply()`: the enable flag is a browser-local
 * preference and a client-only visual layer owns no host configuration.
 *
 * Since DSH 0.1.2-rc.1 that is not enough. The settings page dispatches plugin
 * cards by *served settings namespace* — `settings.plugin.item` is a keyed slot
 * rendered once per namespace the host answers for, and the key must match one
 * of them. Aqua's card is keyed `aqua`, but the host served no such namespace,
 * so the card never dispatched: registering the keyed slot first threw
 * `keyed slot "settings.plugin.item" requires options.key`, and would have
 * rendered nothing even once the key was supplied.
 *
 * The stored values are not the point — Aqua keeps them in localStorage behind
 * the browser half. This half therefore registers an empty pass-through
 * namespace whose only job is to make the card dispatchable. Its schema is
 * duck-typed to what the settings seam calls on it (callable plus `toJSON`), so
 * this package still needs no `@deepseek-ai/*` import at runtime.
 */

/** Settings namespace the browser half's card is keyed by. */
const AQUA_NAMESPACE = 'aqua'

/** Schema-shaped callable the settings seam accepts in place of a real schema. */
interface PassThroughSchema {
  (value: unknown): Record<string, unknown>
  toJSON(): {
    uid: number
    refs: Record<string, { type: string; meta: { default: Record<string, unknown> }; dict: Record<string, unknown> }>
  }
}

/** Minimal host context surface used here (avoids a runtime package import). */
interface HostContext {
  inject?: (deps: string[], callback: (scope: { settings: { register: (name: string, schema: unknown, options: { base: Record<string, unknown> } ) => unknown } }) => void) => void
}

const passThroughSchema = ((value: unknown) => ({ ...((value ?? {}) as Record<string, unknown>) })) as PassThroughSchema

passThroughSchema.toJSON = () => ({
  uid: 0,
  refs: { 0: { type: 'object', meta: { default: {} }, dict: {} } },
})

/**
 * Host plugin body: advertise the namespace the Aqua settings card dispatches
 * on, so `Settings → Plugins` can render its master switch.
 * @param ctx - cordis host context.
 */
export function apply(ctx: HostContext): void {
  if (typeof ctx.inject !== 'function') return
  ctx.inject(['settings'], (scope) => {
    try {
      scope.settings.register(AQUA_NAMESPACE, passThroughSchema, { base: {} })
    } catch (error) {
      console.error(`[ui-aqua] settings namespace skipped: ${String(error)}`)
    }
  })
}
