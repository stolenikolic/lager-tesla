import { Category, Subcategory, Item } from '../types/inventory'
import { supabase } from '../supabase/supabaseClient'

const STORAGE_KEY = 'inventoryItems'
// const INITIALIZED_KEY = 'inventoryInitialized'

const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Računarske komponente' },
  { id: 'cat-2', name: 'Periferija' },
  { id: 'cat-3', name: 'Mreža' },
  { id: 'cat-4', name: 'Ostalo' },
]

const defaultSubcategories: Subcategory[] = [
  { id: 'sub-1', name: 'Procesori', categoryId: 'cat-1' },
  { id: 'sub-2', name: 'Maticne ploce', categoryId: 'cat-1' },
  { id: 'sub-3', name: 'RAM memorije', categoryId: 'cat-1' },
  { id: 'sub-4', name: 'Napajanja', categoryId: 'cat-1' },
  { id: 'sub-5', name: 'Graficke kartice', categoryId: 'cat-1' },
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

// const seedItems: Item[] = [
//   {
//     id: 'item-1',
//     barcode: '1234567890123',
//     name: 'INTEL Core i7-13700KF 3.40GHz LGA-1700 BOXX',
//     supplier: 'IPON',
//     imageUrl:
//       'https://media.icdn.hu/product/2022-09/833189/2004182_intel-core-i7-13700kf-250ghz-lga-1700-box.webp',
//     purchasePrice: 350.0,
//     quantity: 12,
//     categoryId: 'cat-1',
//     subcategoryId: 'sub-1',
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: 'item-2',
//     barcode: '2345678901234',
//     name: 'ASUS ROG STRIX B650E-F GAMING WIFI',
//     supplier: 'IPON',
//     imageUrl:
//       'https://media.icdn.hu/product/2022-11/861290/2056721_asus-rog-strix-b650e-f-gaming-wifi.webp',
//     purchasePrice: 180.0,
//     quantity: 8,
//     categoryId: 'cat-1',
//     subcategoryId: 'sub-2',
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: 'item-3',
//     barcode: '3456789012345',
//     name: 'KINGSTON FURY 32GB Beast RGB DDR5 5600MHz CL36 KIT',
//     supplier: 'CPU',
//     imageUrl:
//       'https://media.icdn.hu/product/2022-09/831757/1999502_kingston-fury-32gb-beast-rgb-ddr5-5600mhz-cl36-kit-kf556c36bbeak2-32.webp',
//     purchasePrice: 145.0,
//     quantity: 15,
//     categoryId: 'cat-1',
//     subcategoryId: 'sub-3',
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: 'item-4',
//     barcode: '4567890123456',
//     name: 'LOGITECH G502 Lightspeed black',
//     supplier: 'Alza',
//     imageUrl:
//       'https://media.icdn.hu/product/2019-07/559569/1261083_logitech_g502_lightspeed.webp',
//     purchasePrice: 45.0,
//     quantity: 25,
//     categoryId: 'cat-2',
//     subcategoryId: 'sub-8',
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: 'item-5',
//     barcode: '5678901234567',
//     name: 'SAMSUNG Odyssey G3 G30D 24 LS24DG300EUXEN',
//     supplier: 'CPU',
//     imageUrl:
//       'https://media.icdn.hu/product/2024-07/622432/1669413_samsung-odyssey-g3-g30d-27-ls27dg302euxen.webp',
//     purchasePrice: 420.0,
//     quantity: 5,
//     categoryId: 'cat-2',
//     subcategoryId: 'sub-9',
//     createdAt: new Date().toISOString(),
//   },
// ]

type DbItem = {
  id: string
  barcode: string
  name: string
  supplier: string
  imageurl: string | null
  purchaseprice: number
  quantity: number
  categoryid: string | null
  subcategoryid: string | null
  createdat: string
}

// mapiranje DB -> Item interfejs koji koristiš u app-u
function mapDbToItem(row: DbItem): Item {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    supplier: row.supplier,
    imageUrl: row.imageurl ?? '',
    purchasePrice: row.purchaseprice,
    quantity: row.quantity,
    categoryId: row.categoryid ?? '',
    subcategoryId: row.subcategoryid ?? '',
    createdAt: row.createdat,
  }
}

// mapiranje Item -> DB oblik (za insert/update)
export function mapItemToDb(item: Omit<Item, 'id'>) {
  return {
    barcode: item.barcode,
    name: item.name,
    supplier: item.supplier,
    imageurl: item.imageUrl,
    purchaseprice: item.purchasePrice,
    quantity: item.quantity,
    categoryid: item.categoryId,
    subcategoryid: item.subcategoryId,
    createdat: item.createdAt,
  }
}

export function getCategories(): Category[] {
  return defaultCategories
}

export function getSubcategories(): Subcategory[] {
  return defaultSubcategories
}

export function getSubcategoriesByCategory(categoryId: string): Subcategory[] {
  return defaultSubcategories.filter((sub) => sub.categoryId === categoryId)
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

// ====== RAD SA BAZOM (SUPABASE) ======

// Učitavanje svih artikala
export async function getItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('createdat', { ascending: false })

    if (error) {
      console.error('Greška pri učitavanju iz Supabase:', error)
      return []
    }

    if (!data) return []

    return (data as DbItem[]).map(mapDbToItem)
  } catch (err) {
    console.error('Neočekivana greška pri getItems:', err)
    return []
  }
}

export function saveItems(items: Item[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Dodavanje artikla
export async function addItem(newItem: Omit<Item, 'id'>): Promise<boolean> {
  try {
    const dbItem = mapItemToDb(newItem)

    const { error } = await supabase.from('items').insert([dbItem])

    if (error) {
      console.error('Supabase addItem error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Neočekivana greška pri addItem:', err)
    return false
  }
}

// Ažuriranje postojećeg artikla
export async function updateItem(updatedItem: Item): Promise<boolean> {
  try {
    const dbItem = mapItemToDb(updatedItem)

    const { error } = await supabase
      .from('items')
      .update(dbItem)
      .eq('id', updatedItem.id)

    if (error) {
      console.error('Supabase updateItem error:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Neočekivana greška pri updateItem:', err)
    return false
  }
}

// Pronalaženje artikla po barkodu
export async function findItemByBarcode(barcode: string): Promise<Item | null> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle()

  if (error) {
    // kod PGRST116 = nema redova, nije realna greška
    if (error.code !== 'PGRST116') {
      console.warn('Greška pri findItemByBarcode:', error)
    }
    return null
  }

  if (!data) return null

  return mapDbToItem(data as DbItem)
}

// Smanjenje količine po barkodu
export async function decrementItemQuantityByBarcode(barcode: string): Promise<{
  success: boolean
  message: string
  item?: Item
}> {
  // 1. Nađi artikal
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Greška pri traženju artikla za decrement:', error)
    return { success: false, message: 'Greška pri traženju artikla' }
  }

  if (!data) {
    return {
      success: false,
      message: 'Artikal nije pronađen',
    }
  }

  const dbItem = data as DbItem

  if (dbItem.quantity <= 0) {
    return {
      success: false,
      message: 'Nema na lageru',
      item: mapDbToItem(dbItem),
    }
  }

  const newQuantity = dbItem.quantity - 1

  const { data: updatedData, error: updateError } = await supabase
    .from('items')
    .update({ quantity: newQuantity })
    .eq('id', dbItem.id)
    .select('*')
    .maybeSingle()

  if (updateError || !updatedData) {
    console.error('Greška pri smanjenju količine:', updateError)
    return {
      success: false,
      message: 'Došlo je do greške pri smanjenju količine',
      item: mapDbToItem(dbItem),
    }
  }

  const updatedItem = mapDbToItem(updatedData as DbItem)

  return {
    success: true,
    message: `Količina smanjena: ${updatedItem.name} (${updatedItem.quantity} preostalo)`,
    item: updatedItem,
  }
}
