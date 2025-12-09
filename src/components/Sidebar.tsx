import { useState } from 'react';
import { ChevronDown, ChevronRight, Package } from 'lucide-react';
import { Category, Subcategory } from '../types/inventory';

interface SidebarProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onSubcategorySelect: (subcategoryId: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  categories,
  subcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  onCategorySelect,
  onSubcategorySelect,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(cat => cat.id))
  );

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      onCategorySelect(null);
      onSubcategorySelect(null);
    } else {
      onCategorySelect(categoryId);
      onSubcategorySelect(null);
      if (!expandedCategories.has(categoryId)) {
        toggleCategory(categoryId);
      }
    }
  };

  const handleSubcategoryClick = (subcategoryId: string, categoryId: string) => {
    if (selectedSubcategoryId === subcategoryId) {
      onSubcategorySelect(null);
    } else {
      onCategorySelect(categoryId);
      onSubcategorySelect(subcategoryId);
    }
    onClose();
  };

  const handleAllClick = () => {
    onCategorySelect(null);
    onSubcategorySelect(null);
    onClose();
  };

  const getSubcategoriesByCategory = (categoryId: string) => {
    return subcategories.filter(sub => sub.categoryId === categoryId);
  };

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-6 h-6 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">Kategorije</h2>
        </div>
      </div>

      <div className="p-2">
        <button
          onClick={handleAllClick}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            !selectedCategoryId && !selectedSubcategoryId
              ? 'bg-blue-100 text-blue-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Svi artikli
        </button>

        <div className="mt-2 space-y-1">
          {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const isSelected = selectedCategoryId === category.id && !selectedSubcategoryId;
            const categorySubcategories = getSubcategoriesByCategory(category.id);

            return (
              <div key={category.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {categorySubcategories.map(subcategory => {
                      const isSubSelected = selectedSubcategoryId === subcategory.id;
                      return (
                        <button
                          key={subcategory.id}
                          onClick={() => handleSubcategoryClick(subcategory.id, category.id)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                            isSubSelected
                              ? 'bg-blue-50 text-blue-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {subcategory.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
