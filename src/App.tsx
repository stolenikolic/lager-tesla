import { useState, useEffect, KeyboardEvent } from 'react'
import { Plus, Package, Minus, Menu, X } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ItemTable from './components/ItemTable'
import AddItemModal from './components/AddItemModal'
import { useToast } from './contexts/ToastContext'
import {
  getCategories,
  getSubcategories,
  getItems,
  decrementItemQuantityByBarcode,
} from './services/inventoryService'
import { Item } from './types/inventory'

function App() {
  const { showToast } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  )
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    string | null
  >(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [decrementBarcode, setDecrementBarcode] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const categories = getCategories()
  const subcategories = getSubcategories()

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, selectedCategoryId, selectedSubcategoryId])

  const loadItems = () => {
    const allItems = getItems()
    setItems(allItems)
  }

  const filterItems = () => {
    let filtered = [...items]

    if (selectedSubcategoryId) {
      filtered = filtered.filter(
        (item) => item.subcategoryId === selectedSubcategoryId
      )
    } else if (selectedCategoryId) {
      filtered = filtered.filter(
        (item) => item.categoryId === selectedCategoryId
      )
    }

    setFilteredItems(filtered)
  }

  const handleDecrementBarcodeKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Enter' && decrementBarcode.trim()) {
      e.preventDefault()
      handleDecrementStock()
    }
  }

  const handleDecrementStock = () => {
    const barcode = decrementBarcode.trim()
    if (!barcode) {
      showToast('Unesite barkod', 'error')
      return
    }

    const result = decrementItemQuantityByBarcode(barcode)

    if (result.success) {
      showToast(result.message, 'success')
      loadItems()
      setDecrementBarcode('')
    } else {
      showToast(result.message, 'error')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        categories={categories}
        subcategories={subcategories}
        selectedCategoryId={selectedCategoryId}
        selectedSubcategoryId={selectedSubcategoryId}
        onCategorySelect={setSelectedCategoryId}
        onSubcategorySelect={setSelectedSubcategoryId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 z-10">
          <div className="px-4 py-4 md:px-8 md:py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  {isSidebarOpen ? (
                    <X className="w-6 h-6 text-gray-700" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-700" />
                  )}
                </button>
                <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-700 flex-shrink-0" />
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  Lager Telsa
                </h1>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm md:text-base min-h-[44px]"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Dodaj artikal</span>
                <span className="sm:hidden">Dodaj</span>
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <Minus className="w-5 h-5 text-gray-600 hidden sm:block flex-shrink-0" />
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skeniraj barkod za skidanje sa lagera
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={decrementBarcode}
                      onChange={(e) => setDecrementBarcode(e.target.value)}
                      onKeyDown={handleDecrementBarcodeKeyDown}
                      placeholder="Skenirajte barkod"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px]"
                    />
                    <button
                      onClick={handleDecrementStock}
                      disabled={!decrementBarcode.trim()}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors min-h-[44px] whitespace-nowrap"
                    >
                      Smanji stanje
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 md:px-8 md:py-6">
            <ItemTable items={filteredItems} />
          </div>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        subcategories={subcategories}
        onItemAdded={loadItems}
      />
    </div>
  )
}

export default App
