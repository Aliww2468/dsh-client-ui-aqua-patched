/**
 * Aqua card registered into the Plugins settings section's configurable tab
 * (`settings.plugin.item` on DSH 0.1, `plugins.bundle.config` on DSH 0.2):
 * the master on/off switch — name, description, and
 * one toggle, in the section's card language. Every other knob lives in the
 * General settings' Appearance row, so the card stays the same shape as the
 * other plugin cards.
 */
import { AquaCheckIcon } from './AquaCheckIcon.tsx'
import type { InjectFace, PropsLocale, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createAquaRowStore } from './settings-store.ts'
import css from './AquaPluginCard.module.css'

/** Injected business face: the master enable write. */
export interface AquaPluginCardInjected {
  /** Switch the glass layer on or off. */
  setEnabled: (enabled: boolean) => void
}

/** Only the shares this card consumes, shared by the legacy and modern slots. */
export type AquaPluginCardComponentProps =
  PropsStore<ReturnType<typeof createAquaRowStore>>
  & PropsLocale<'settings.aqua'> & InjectFace<AquaPluginCardInjected>

/**
 * Render the Aqua plugin card.
 * @param props - composed slot props.
 * @returns the card list item.
 */
export function AquaPluginCard(props: AquaPluginCardComponentProps) {
  const { t, setEnabled, useStore } = props
  const enabled = useStore(s => s.enabled)
  return (
    <li className={css.card}>
      <div className={css.head}>
        <div className={css.text}>
          <div className={css.title}>{t('aqua.title')}</div>
          <div className={css.description}>{t('aqua.description')}</div>
        </div>
        <button
          type="button"
          className={css.toggle}
          aria-pressed={enabled}
          onClick={() => { setEnabled(!enabled) }}
        >
          <span className={css.check}>
            {enabled && <AquaCheckIcon />}
          </span>
          {enabled ? t('aqua.enable') : t('aqua.disable')}
        </button>
      </div>
    </li>
  )
}

/** The modern package-config slot is a section, so supply the card's list parent. */
export function AquaPluginPage(props: AquaPluginCardComponentProps) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      <AquaPluginCard {...props} />
    </ul>
  )
}
