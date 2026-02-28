import { useEffect } from 'react'

export function useAgentStream(onMessage: (message: unknown) => void) {
  useEffect(() => {
    // TODO: connect to agent event stream (e.g., WebSocket or SSE)
    onMessage({ type: 'connected' })
  }, [onMessage])
}

