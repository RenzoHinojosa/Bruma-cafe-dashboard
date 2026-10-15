import { useCallback, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    setStoredValue((currentValue) => {
      const nextValue = value instanceof Function ? value(currentValue) : value
      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue))
      } catch {
        // La interfaz sigue funcionando si el navegador bloquea el almacenamiento.
      }
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
