import { createContext, useContext, useState } from 'react'

const cacheContext = createContext([])

export const CacheProvider = ({ children, ...props }) => {
  const [state, setState] = useState({})

  return (
    <cacheContext.Provider {...props} value={[state, setState]}>
      {children}
    </cacheContext.Provider>
  )
}

export const useCacheContext = () => useContext(cacheContext)
