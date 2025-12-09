import { Category, Subcategory, Item } from '../types/inventory'

const STORAGE_KEY = 'inventoryItems'
const INITIALIZED_KEY = 'inventoryInitialized'

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Računarske komponente' },
  { id: 'cat-2', name: 'Periferija' },
  { id: 'cat-3', name: 'Mreža' },
  { id: 'cat-4', name: 'Ostalo' },
]

const defaultSubcategories: Subcategory[] = [
  { id: 'sub-1', name: 'CPU', categoryId: 'cat-1' },
  { id: 'sub-2', name: 'MBO', categoryId: 'cat-1' },
  { id: 'sub-3', name: 'RAM', categoryId: 'cat-1' },
  { id: 'sub-4', name: 'PSU', categoryId: 'cat-1' },
  { id: 'sub-5', name: 'GPU', categoryId: 'cat-1' },
  { id: 'sub-6', name: 'SSD', categoryId: 'cat-1' },
  { id: 'sub-7', name: 'HDD', categoryId: 'cat-1' },
  { id: 'sub-8', name: 'Miševi', categoryId: 'cat-2' },
  { id: 'sub-9', name: 'Monitori', categoryId: 'cat-2' },
  { id: 'sub-10', name: 'Tastature', categoryId: 'cat-2' },
  { id: 'sub-11', name: 'Slušalice', categoryId: 'cat-2' },
  { id: 'sub-12', name: 'Ruteri', categoryId: 'cat-3' },
  { id: 'sub-13', name: 'Switchevi', categoryId: 'cat-3' },
  { id: 'sub-14', name: 'Kamere', categoryId: 'cat-4' },
]

const seedItems: Item[] = [
  {
    id: 'item-1',
    barcode: '1234567890123',
    name: 'INTEL Core i7-13700KF 3.40GHz LGA-1700 BOXX',
    supplier: 'IPON',
    imageUrl:
      'https://media.icdn.hu/product/2022-09/833189/2004182_intel-core-i7-13700kf-250ghz-lga-1700-box.webp',
    purchasePrice: 350.0,
    quantity: 12,
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    barcode: '2345678901234',
    name: 'ASUS ROG STRIX B650E-F GAMING WIFI',
    supplier: 'IPON',
    imageUrl:
      'https://media.icdn.hu/product/2022-11/861290/2056721_asus-rog-strix-b650e-f-gaming-wifi.webp',
    purchasePrice: 180.0,
    quantity: 8,
    categoryId: 'cat-1',
    subcategoryId: 'sub-2',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    barcode: '3456789012345',
    name: 'KINGSTON FURY 32GB Beast RGB DDR5 5600MHz CL36 KIT',
    supplier: 'CPU',
    imageUrl:
      'https://media.icdn.hu/product/2022-09/831757/1999502_kingston-fury-32gb-beast-rgb-ddr5-5600mhz-cl36-kit-kf556c36bbeak2-32.webp',
    purchasePrice: 145.0,
    quantity: 15,
    categoryId: 'cat-1',
    subcategoryId: 'sub-3',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    barcode: '4567890123456',
    name: 'LOGITECH G502 Lightspeed black',
    supplier: 'Alza',
    imageUrl:
      'https://media.icdn.hu/product/2019-07/559569/1261083_logitech_g502_lightspeed.webp',
    purchasePrice: 45.0,
    quantity: 25,
    categoryId: 'cat-2',
    subcategoryId: 'sub-8',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    barcode: '5678901234567',
    name: 'SAMSUNG Odyssey G3 G30D 24 LS24DG300EUXEN',
    supplier: 'CPU',
    imageUrl:
      'https://media.icdn.hu/product/2024-07/622432/1669413_samsung-odyssey-g3-g30d-27-ls27dg302euxen.webp',
    purchasePrice: 420.0,
    quantity: 5,
    categoryId: 'cat-2',
    subcategoryId: 'sub-9',
    createdAt: new Date().toISOString(),
  },
]

export function getCategories(): Category[] {
  return defaultCategories
}

export function getSubcategories(): Subcategory[] {
  return defaultSubcategories
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  return defaultSubcategories.filter((sub) => sub.categoryId === categoryId)
}

function initializeStorage(): void {
  const isInitialized = localStorage.getItem(INITIALIZED_KEY)
  if (!isInitialized) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedItems))
    localStorage.setItem(INITIALIZED_KEY, 'true')
  }
}

export function getItems(): Item[] {
  initializeStorage()
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveItems(items: Item[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addItem(item: Item): void {
  const items = getItems()
  items.push(item)
  saveItems(items)
}

export function updateItem(updatedItem: Item): void {
  const items = getItems()
  const index = items.findIndex((item) => item.id === updatedItem.id)
  if (index !== -1) {
    items[index] = updatedItem
    saveItems(items)
  }
}

export function findItemByBarcode(barcode: string): Item | undefined {
  const items = getItems()
  return items.find((item) => item.barcode === barcode)
}

export function decrementItemQuantityByBarcode(barcode: string): {
  success: boolean
  message: string
  item?: Item
} {
  const items = getItems()
  const item = items.find((i) => i.barcode === barcode)

  if (!item) {
    return {
      success: false,
      message: 'Artikal nije pronađen',
    }
  }

  if (item.quantity <= 0) {
    return {
      success: false,
      message: 'Nema na lageru',
      item,
    }
  }

  item.quantity -= 1
  saveItems(items)

  return {
    success: true,
    message: `Količina smanjena: ${item.name} (${item.quantity} preostalo)`,
    item,
  }
}

export function getCategoryName(categoryId: string): string {
  const category = defaultCategories.find((cat) => cat.id === categoryId)
  return category?.name || ''
}

export function getSubcategoryName(subcategoryId: string): string {
  const subcategory = defaultSubcategories.find(
    (sub) => sub.id === subcategoryId
  )
  return subcategory?.name || ''
}
