'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
// import AdminShell from '@/components/AdminShell'

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true)
      } else {
        router.push('/login?redirect=/admin')
      }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}