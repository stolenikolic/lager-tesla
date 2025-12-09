import { useState } from 'react'
import { Item } from '../types/inventory'
import {
  getCategoryName,
  getSubcategoryName,
} from '../services/inventoryService'
import { Search, ArrowUpDown } from 'lucide-react'

interface ItemTableProps {
  items: Item[]
}

type SortField = 'name' | 'quantity' | 'purchasePrice' | 'supplier'
type SortDirection = 'asc' | 'desc'

export default function ItemTable({ items }: ItemTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.barcode.includes(query) ||
      item.supplier.toLowerCase().includes(query)
    )
  })

  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'quantity':
        comparison = a.quantity - b.quantity
        break
      case 'purchasePrice':
        comparison = a.purchasePrice - b.purchasePrice
        break
      case 'supplier':
        comparison = a.supplier.localeCompare(b.supplier)
        break
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Pretraži po nazivu, barkodu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base min-h-[44px]"
        />
      </div>

      <div className="block md:hidden space-y-3">
        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nema artikala za prikaz
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-4 space-y-3"
            >
              <div className="flex gap-3">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base break-words">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{item.supplier}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full ${
                        item.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : item.quantity < 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      Količina: {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 text-sm">
                <div>
                  <span className="text-gray-500">Kategorija:</span>
                  <p className="font-medium text-gray-900 mt-1 break-words">
                    {getCategoryName(item.categoryId)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Potkategorija:</span>
                  <p className="font-medium text-gray-900 mt-1 break-words">
                    {getSubcategoryName(item.subcategoryId)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Barkod:</span>
                  <p className="font-mono text-gray-900 mt-1 text-xs break-all">
                    {item.barcode}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Cijena:</span>
                  <p className="font-semibold text-gray-900 mt-1">
                    {item.purchasePrice.toFixed(2)} KM
                    {item.supplier?.toLowerCase().includes('cpu') && ' + PDV'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slika
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Naziv
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('supplier')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Dobavljač
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potkategorija
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barkod
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('purchasePrice')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Nabavna cijena
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('quantity')}
                    className="flex items-center gap-1 hover:text-gray-700"
                  >
                    Količina
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nema artikala za prikaz
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.supplier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getCategoryName(item.categoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getSubcategoryName(item.subcategoryId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono">
                        {item.barcode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {item.purchasePrice.toFixed(2)} KM
                        {item.supplier?.toLowerCase().includes('cpu') &&
                          ' + PDV'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-sm font-bold rounded-full ${
                          item.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : item.quantity < 5
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-white px-4 py-3 rounded-lg shadow">
        Prikazano {sortedItems.length} artikala
      </div>
    </div>
  )
}
