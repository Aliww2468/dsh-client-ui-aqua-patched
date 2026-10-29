import type { InjectFace, PropsLocale, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { createAquaRowStore } from './settings-store.ts';
/** Injected business face: the enable write (t rides the standard locale seat). */
export interface AquaPluginCardInjected {
    /** Switch the deep-sea layer on or off. */
    setEnabled: (enabled: boolean) => void;
}
/** Store, locale and injected shares used by either settings entry. */
export type AquaPluginCardComponentProps = PropsStore<ReturnType<typeof createAquaRowStore>> & PropsLocale<'settings.aqua'> & InjectFace<AquaPluginCardInjected>;
/**
 * Render the Aqua plugin card.
 * @param props - composed slot props.
 * @returns the card list item.
 */
export declare function AquaPluginCard({ t, setEnabled, useStore }: AquaPluginCardComponentProps): import("react").JSX.Element;
/** Modern package configuration page, including the card's list parent. */
export declare function AquaPluginPage(props: AquaPluginCardComponentProps): import("react").JSX.Element;
//# sourceMappingURL=AquaPluginCard.d.ts.map
