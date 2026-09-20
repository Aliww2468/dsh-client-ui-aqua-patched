// Step 3: open Settings -> Plugins and report what renders there.
const click = (el) => {
  if (!el) return false
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
  return true
}
const trigger = document.querySelector('[data-slot="settings.trigger"]')
click(trigger ? (trigger.querySelector('button, [role="button"]') || trigger.querySelector('*') || trigger) : null)
await new Promise((r) => setTimeout(r, 2500))

const nav = [...document.querySelectorAll('button, a')].find((e) => (e.textContent || '').trim() === '插件')
const clicked = click(nav)
await new Promise((r) => setTimeout(r, 2500))

const slotsNow = [...new Set([...document.querySelectorAll('[data-slot]')].map((e) => e.getAttribute('data-slot')))]
  .filter((s) => s.indexOf('settings') === 0)
const pluginItem = document.querySelector('[data-slot="settings.plugin.item"]')
const tabText = document.body.innerText.replace(/\s+/g, ' ').slice(0, 700)
return JSON.stringify({
  clickedPluginsTab: clicked,
  slotsNow,
  pluginItemChildren: pluginItem ? pluginItem.children.length : -1,
  uiAquaEnabledFlag: window.localStorage.getItem('dsh.ui-aqua.enabled'),
  settingsText: tabText,
})
