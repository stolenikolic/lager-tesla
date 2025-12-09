export default async function handler(req, res) {
  const allowedOrigins = [
    'https://lager-tesla.vercel.app',
    'https://lager-tesla.netlify.app',
    'http://localhost:5173',
  ]

  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else {
    res.setHeader(
      'Access-Control-Allow-Origin',
      'https://lager-tesla.vercel.app'
    )
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { upc } = req.query

  if (!upc) {
    return res.status(400).json({ error: 'Missing UPC parameter' })
  }

  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`
    )

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const item = data.items[0]

    return res.status(200).json({
      name: item.title || '',
      imageUrl: item.images?.[0] || '',
    })
  } catch (error) {
    console.error('Proxy API error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
}
