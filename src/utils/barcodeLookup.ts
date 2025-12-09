interface ProductLookupResult {
  name: string
  // supplier: string
  imageUrl: string
}

// const mockBarcodeDatabase: Record<string, ProductLookupResult> = {
//   '1234567890123': {
//     name: 'Intel Core i7-13700K',
//     supplier: 'Intel',
//     imageUrl:
//       'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
//   },
//   '2345678901234': {
//     name: 'ASUS ROG Strix B660-F',
//     supplier: 'ASUS',
//     imageUrl:
//       'https://images.pexels.com/photos/2399840/pexels-photo-2399840.jpeg?auto=compress&cs=tinysrgb&w=400',
//   },
//   '3456789012345': {
//     name: 'Corsair Vengeance RGB 32GB DDR5',
//     supplier: 'Corsair',
//     imageUrl:
//       'https://images.pexels.com/photos/163125/board-electronics-computer-data-processing-163125.jpeg?auto=compress&cs=tinysrgb&w=400',
//   },
//   '9876543210987': {
//     name: 'NVIDIA GeForce RTX 4070',
//     supplier: 'NVIDIA',
//     imageUrl:
//       'https://images.pexels.com/photos/8679603/pexels-photo-8679603.jpeg?auto=compress&cs=tinysrgb&w=400',
//   },
//   '8765432109876': {
//     name: 'Corsair RM850x',
//     supplier: 'Corsair',
//     imageUrl:
//       'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
//   },
// }

// const randomSuppliers = [
//   'Intel',
//   'AMD',
//   'ASUS',
//   'MSI',
//   'Corsair',
//   'Kingston',
//   'Samsung',
//   'Logitech',
//   'Razer',
// ]
// const randomImages = [
//   'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
//   'https://images.pexels.com/photos/2399840/pexels-photo-2399840.jpeg?auto=compress&cs=tinysrgb&w=400',
//   'https://images.pexels.com/photos/163125/board-electronics-computer-data-processing-163125.jpeg?auto=compress&cs=tinysrgb&w=400',
//   'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
// ]

export async function lookupProductByBarcode(barcode: string) {
  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
    )
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]

    return {
      name: item.title || '',
      imageUrl: item.images?.[0] || '',
      supplier: item.brand || '',
    }
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return null
  }
}
