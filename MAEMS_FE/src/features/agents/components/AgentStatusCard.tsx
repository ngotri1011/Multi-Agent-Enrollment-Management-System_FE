type AgentStatusCardProps = {
  name: string
  status: string
}

export function AgentStatusCard({ name, status }: AgentStatusCardProps) {
  return (
    <div>
      <div>{name}</div>
      <div>{status}</div>
    </div>
  )
}

