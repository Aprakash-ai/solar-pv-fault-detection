import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useHistory(uid) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'predictions'),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    return onSnapshot(
      q,
      (snapshot) => {
        setItems(
          snapshot.docs.map((d) => {
            const data = d.data({ serverTimestamps: 'estimate' })
            return { id: d.id, ...data, createdAt: data.createdAt.toDate() }
          }),
        )
        setError('')
        setLoading(false)
      },
      () => {
        setError('Could not load your history. Check your connection and Firestore rules.')
        setLoading(false)
      },
    )
  }, [uid])

  return { items, loading, error }
}