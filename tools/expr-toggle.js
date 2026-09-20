// Step 4: functional test of the restored master switch — click the Aqua card
// toggle in Settings -> Plugins and assert the visual layer turns off and back on.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const click = (el) => {
  if (!el) return false
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  return true
}

const trigger = document.querySelector('[data-slot="settings.trigger"]')
click(trigger ? (trigger.querySelector('button, [role="button"]') || trigger.querySelector('*') || trigger) : null)
await sleep(2500)
const nav = [...document.querySelectorAll('button, a')].find((e) => (e.textContent || '').trim() === '插件')
click(nav)
await sleep(2500)

const slot = document.querySelector('[data-slot="settings.plugin.item"]')
const cards = slot ? [...slot.children] : []
const card = cards.find((e) => (e.textContent || '').includes('玻璃主题')) ?? null
const toggle = card ? card.querySelector('[role="switch"], button, input') : null

const appliedBefore = document.querySelector('[data-dsh-aqua-ambient]') !== null
const switchedOff = click(toggle)
await sleep(2000)
const appliedAfterOff = document.querySelector('[data-dsh-aqua-ambient]') !== null
const flagAfterOff = window.localStorage.getItem('dsh.ui-aqua.enabled')
const canvasAfterOff = document.querySelector('[data-dsh-aqua-fluid-canvas]') !== null

click(toggle)
await sleep(2000)
const appliedAfterOn = document.querySelector('[data-dsh-aqua-ambient]') !== null
const flagAfterOn = window.localStorage.getItem('dsh.ui-aqua.enabled')

return JSON.stringify({
  cardCount: cards.length,
  cardText: card ? (card.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) : null,
  foundToggle: toggle !== null,
  appliedBefore,
  switchedOff,
  appliedAfterOff,
  canvasAfterOff,
  flagAfterOff,
  appliedAfterOn,
  flagAfterOn,
})
