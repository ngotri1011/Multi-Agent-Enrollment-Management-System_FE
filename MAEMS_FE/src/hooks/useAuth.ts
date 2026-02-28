import { useState } from 'react'

export function useAuth() {
  const [user, setUser] = useState<unknown>(null)

  return { user, setUser }
}

