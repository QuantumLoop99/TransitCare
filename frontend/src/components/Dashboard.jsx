import { useUser } from '@clerk/clerk-react'

export default function Dashboard() {
  const { user } = useUser()
  const role = user.publicMetadata.role || 'passenger'

  return (
    <main style={{ padding: '1rem' }}>
      <h2>Welcome, {user.firstName} ({role})</h2>
      {role === 'admin' && <InviteUsers />}
    </main>
  )
}