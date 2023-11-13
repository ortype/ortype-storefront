import { autorun, toJS } from 'mobx'

/*
import { autorun, set, toJS } from 'mobx'
export function autoSave(store, name) {
  const storedJson = localStorage.getItem(name)
  if (storedJson) {
    set(store, JSON.parse(storedJson))
  }
  autorun(() => {
    const value = toJS(store)
    localStorage.setItem(name, JSON.stringify(value))
  })
}
*/

export function makeLocalStorage<T extends object, K extends keyof T>(
  store: T,
  prefix: string,
  keys: K[]
): void {
  for (const key of keys) {
    const localKey = `${prefix}_${key.name}`

    const valueStr = localStorage.getItem(localKey)

    if (!valueStr) {
      continue
    }

    const value = JSON.parse(valueStr)
    store[key.action] && store[key.action](value) // this is the store setters
    // @TODO: this seems to throw some errors
    // [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: ObservableObject@1.fontFamily
  }

  autorun(() => {
    for (const key of keys) {
      const localKey = `${prefix}_${key.name}`
      localStorage.setItem(localKey, JSON.stringify(toJS(store[key.name]))) // local storage setters
    }
  })
}
