import { useState, useEffect, FormEvent, KeyboardEvent } from 'react'
import { X, Loader2, Barcode as BarcodeIcon } from 'lucide-react'
import { Category, Subcategory, Item, FormErrors } from '../types/inventory'
import {
  addItem,
  getSubcategoriesByCategory,
  findItemByBarcode,
  updateItem,
} from '../services/inventoryService'
import { lookupProductByBarcode } from '../utils/barcodeLookup'
import { useToast } from '../contexts/ToastContext'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  subcategories: Subcategory[]
  onItemAdded: () => void
}

export default function AddItemModal({
  isOpen,
  onClose,
  categories,
  onItemAdded,
}: AddItemModalProps) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    supplier: '',
    imageUrl: '',
    purchasePrice: '',
    quantity: '1',
    categoryId: '',
    subcategoryId: '',
  })

  const [availableSubcategories, setAvailableSubcategories] = useState<
    Subcategory[]
  >([])

  useEffect(() => {
    if (formData.categoryId) {
      const subs = getSubcategoriesByCategory(formData.categoryId)
      setAvailableSubcategories(subs)
      if (!subs.find((sub) => sub.id === formData.subcategoryId)) {
        setFormData((prev) => ({ ...prev, subcategoryId: '' }))
      }
    } else {
      setAvailableSubcategories([])
    }
  }, [formData.categoryId, formData.subcategoryId])

  const resetForm = () => {
    setFormData({
      barcode: '',
      name: '',
      supplier: '',
      imageUrl: '',
      purchasePrice: '',
      quantity: '1',
      categoryId: '',
      subcategoryId: '',
    })
    setErrors({})
    setAvailableSubcategories([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBarcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.barcode.trim()) {
      e.preventDefault()
      handleFetchByBarcode()
    }
  }

  const handleFetchByBarcode = async () => {
    const barcode = formData.barcode.trim()
    if (!barcode) {
      showToast('Unesite barkod', 'error')
      return
    }

    // prvo probaj da nađeš u bazi
    const existingItem = await findItemByBarcode(barcode)
    if (existingItem) {
      setFormData((prev) => ({
        ...prev,
        name: existingItem.name,
        supplier: existingItem.supplier,
        imageUrl: existingItem.imageUrl,
        purchasePrice: existingItem.purchasePrice.toString(),
        quantity: '1',
        categoryId: existingItem.categoryId,
        subcategoryId: existingItem.subcategoryId,
      }))
      showToast('Artikal već postoji – podaci su učitani iz baze', 'success')
      return
    }

    // ako nema u bazi, koristi UPC lookup
    setIsFetchingBarcode(true)
    try {
      const result = await lookupProductByBarcode(barcode)
      if (result) {
        setFormData((prev) => ({
          ...prev,
          name: result.name,
          // supplier ostavi prazno ili ga user popunjava ručno
          imageUrl: result.imageUrl,
        }))
        showToast('Podaci preuzeti sa UPC servisa', 'success')
      } else {
        showToast('Nije moguće preuzeti podatke za ovaj barkod', 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Greška prilikom preuzimanja podataka', 'error')
    } finally {
      setIsFetchingBarcode(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barkod je obavezan'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Naziv je obavezan'
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Dobavljač je obavezan'
    }
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL slike je obavezan'
    }
    if (!formData.purchasePrice || parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Nabavna cijena mora biti veća od 0'
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Količina mora biti 0 ili veća'
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Kategorija je obavezna'
    }
    if (!formData.subcategoryId) {
      newErrors.subcategoryId = 'Potkategorija je obavezna'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('Molimo popunite sva obavezna polja', 'error')
      return
    }

    setIsLoading(true)

    try {
      const barcode = formData.barcode.trim()
      const quantityToAdd = parseInt(formData.quantity || '1', 10) || 1

      const existingItem = await findItemByBarcode(barcode)

      if (existingItem) {
        // Ažuriramo postojeći artikal
        const updatedItem: Item = {
          ...existingItem,
          name: formData.name.trim(),
          supplier: formData.supplier.trim(),
          imageUrl: formData.imageUrl.trim(),
          purchasePrice: parseFloat(formData.purchasePrice),
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId,
          quantity: existingItem.quantity + quantityToAdd,
        }

        const success = await updateItem(updatedItem)

        if (success) {
          showToast(
            `Dodano ${quantityToAdd} kom. Nova količina: ${updatedItem.quantity}`,
            'success'
          )
          await onItemAdded() // povlači nove podatke iz supabase
          handleClose()
        } else {
          showToast('Greška pri ažuriranju artikla', 'error')
        }
        return

        onItemAdded()
        handleClose()
        return
      }

      // Ako ne postoji – pravimo novi artikal
      const newItem: Omit<Item, 'id'> = {
        barcode: formData.barcode.trim(),
        name: formData.name.trim(),
        supplier: formData.supplier.trim(),
        imageUrl: formData.imageUrl.trim(),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseInt(formData.quantity, 10),
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId,
        createdAt: new Date().toISOString(),
      }

      const success = await addItem(newItem)

      if (success) {
        showToast('Artikal uspješno dodat', 'success')
        onItemAdded()
        handleClose()
      } else {
        showToast('Greška prilikom dodavanja artikla u bazu', 'error')
      }
    } catch (error) {
      console.error(error)
      showToast('Greška prilikom dodavanja artikla', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 flex items-center justify-between z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Dodaj artikal
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Zatvori"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barkod <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <div className="relative">
                  <BarcodeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    onKeyDown={handleBarcodeKeyDown}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                      errors.barcode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Skenirajte ili unesite barkod"
                  />
                </div>
                {errors.barcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleFetchByBarcode}
                disabled={isFetchingBarcode || !formData.barcode.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px] whitespace-nowrap text-sm sm:text-base"
              >
                {isFetchingBarcode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preuzimanje...
                  </>
                ) : (
                  'Preuzmi podatke'
                )}
              </button>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Skenirajte barkod ili unesite ručno, zatim kliknite "Preuzmi
              podatke"
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Naziv artikla <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Naziv proizvoda"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dobavljač <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                errors.supplier ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ime dobavljača"
            />
            {errors.supplier && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slika (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                errors.imageUrl ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
            )}
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/100?text=Invalid+URL'
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nabavna cijena (KM) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                  errors.purchasePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.purchasePrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Količina <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorija <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Izaberite kategoriju</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potkategorija <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) =>
                  setFormData({ ...formData, subcategoryId: e.target.value })
                }
                disabled={!formData.categoryId}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px] disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.subcategoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Izaberite potkategoriju</option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subcategoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subcategoryId}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] text-base"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[44px] text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dodavanje...
                </>
              ) : (
                'Dodaj artikal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
