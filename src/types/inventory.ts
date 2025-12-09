export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Item {
  id: string;
  barcode: string;
  name: string;
  supplier: string;
  imageUrl: string;
  purchasePrice: number;
  quantity: number;
  categoryId: string;
  subcategoryId: string;
  createdAt: string;
}

export interface FormErrors {
  barcode?: string;
  name?: string;
  supplier?: string;
  imageUrl?: string;
  purchasePrice?: string;
  quantity?: string;
  categoryId?: string;
  subcategoryId?: string;
}
