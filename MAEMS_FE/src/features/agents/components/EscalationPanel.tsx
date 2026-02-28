type EscalationPanelProps = {
  requestId: string
}

export function EscalationPanel({ requestId }: EscalationPanelProps) {
  return <div>Escalation Panel for request {requestId}</div>
}

