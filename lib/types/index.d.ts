/**
 * Aqua theme-layer plugin, node half.
 *
 * Upstream this half is an empty `apply()`. Since DSH 0.1.2-rc.1 the settings
 * page dispatches plugin cards by served settings namespace, so the host half
 * registers an empty pass-through namespace (`aqua`) that makes the browser
 * half's master-switch card dispatchable. See REPAIR.md for the full story.
 */
/** Settings namespace the browser half's card is keyed by. */
export declare const AQUA_NAMESPACE: "aqua";
/** Minimal host context surface used by this half. */
export interface HostContext {
    inject?: (deps: string[], callback: (scope: {
        settings: {
            register: (name: string, schema: unknown, options: {
                base: Record<string, unknown>;
            }) => unknown;
        };
    }) => void) => void;
}
/**
 * Host plugin body: advertise the namespace the Aqua settings card dispatches
 * on, so `Settings → Plugins` can render its master switch.
 * @param ctx - cordis host context.
 */
export declare function apply(ctx: HostContext): void;
