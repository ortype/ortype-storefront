import { autorun, toJS } from 'mobx'

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
    store[key.action] && store[key.action](value)
  }

  // @TODO: what's the correct return type for autorun?
  return autorun(() => {
    // this is local storage setter
    for (const key of keys) {
      const localKey = `${prefix}_${key.name}`
      localStorage.setItem(localKey, JSON.stringify(toJS(store[key.name]))) // local storage setters
    }
  })
}
