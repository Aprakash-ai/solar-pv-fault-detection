const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export async function predict(reading) {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reading),
  })
  if (!response.ok) {
    throw new Error(`Prediction failed (${response.status})`)
  }
  return response.json()
}