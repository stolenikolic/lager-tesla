export async function lookupProductByBarcode(barcode: string) {
  try {
    // const response = await fetch(`/api/upc?upc=${barcode}`)
    const response = await fetch(
      `https://lager-tesla.vercel.app/api/upc?upc=${barcode}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return null
  }
}
