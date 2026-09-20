//#region lib/types/index.js
/**
* Aqua theme-layer plugin, node half.
*
* Upstream this half is an empty `apply()`: the enable flag is a browser-local
* preference and a client-only visual layer owns no host configuration.
*
* Why that broke on DSH 0.1.2-rc.1 (repair note):
* The settings page dispatches plugin cards by *served settings namespace* —
* `settings.plugin.item` is a keyed slot rendered once per namespace the host
* answers for. Aqua's card is keyed "aqua" but the host served no such
* namespace, so the card never dispatched: registering the keyed slot threw
* `keyed slot "settings.plugin.item" requires options.key` before the client
* half supplied the key, and would have rendered nothing even after it did.
*
* The values are irrelevant here: Aqua keeps them in localStorage behind the
* browser half. This half therefore registers an empty pass-through namespace
* whose only job is to make the card dispatchable. Its schema is duck-typed to
* what the settings seam calls on it (callable plus `toJSON`), so no
* `@deepseek-ai/*` import is required at runtime.
*/
/** Settings namespace the browser half's card is keyed by. */
const AQUA_NAMESPACE = "aqua";
/**
* Duck-typed schema: the seam treats it as a callable with a JSON description.
* @param value - candidate config value.
* @returns the value as a plain object.
*/
function passThroughSchema(value) {
    return { ...(value ?? {}) };
}
passThroughSchema.toJSON = () => ({
    uid: 0,
    refs: { 0: { type: "object", meta: { default: {} }, dict: {} } }
});
/**
* Host plugin body: advertise the namespace the Aqua settings card dispatches
* on, so `Settings → Plugins` can render its master switch.
* @param ctx - cordis host context.
*/
function apply(ctx) {
    if (typeof ctx.inject !== "function") return;
    ctx.inject(["settings"], (scope) => {
        try {
            scope.settings.register(AQUA_NAMESPACE, passThroughSchema, { base: {} });
        } catch (error) {
            console.error(`[ui-aqua] settings namespace skipped: ${String(error)}`);
        }
    });
}
//#endregion
export { apply };
