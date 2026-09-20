// Step 2 of the Aqua repair test: open Settings and inspect the General
// settings column, where Aqua registers its appearance controls.
const click = (el) => {
  if (!el) return false
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  return true
}
const trigger = document.querySelector('[data-slot="settings.trigger"]')
const btn = trigger ? (trigger.querySelector('button, [role="button"]') || trigger.querySelector('*') || trigger) : null
const opened = click(btn)
await new Promise((r) => setTimeout(r, 3000))

const slotsNow = [...new Set([...document.querySelectorAll('[data-slot]')].map((e) => e.getAttribute('data-slot')))]
  .filter((s) => s.indexOf('settings') === 0)
const gen = document.querySelector('[data-slot="settings.general.item"]')
const genChildren = gen ? gen.children.length : -1
const genText = gen ? gen.textContent.replace(/\s+/g, ' ').trim().slice(0, 500) : null
const navItems = [...document.querySelectorAll('button, a')]
  .map((e) => (e.textContent || '').trim())
  .filter((t) => t.length > 0 && t.length < 14)
  .slice(0, 30)
return JSON.stringify({ opened, slotsNow, genChildren, genText, navItems })
