import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  sku: string
  price: number
  comparePrice?: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  images?: string[]
  tags?: string[]
  categoryId: string
  category?: {
    id: string
    name: string
    slug: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
}

interface ProductState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  filters: {
    category?: string
    priceRange?: [number, number]
    search?: string
    status?: string
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  isLoading: boolean
  error: string | null
}

const initialState: ProductState = {
  products: [],
  categories: [],
  currentProduct: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload
    },
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
      if (state.currentProduct?.id === action.payload.id) {
        state.currentProduct = action.payload
      }
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {}
    },
    setPagination: (state, action: PayloadAction<Partial<ProductState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProducts,
  setCategories,
  setCurrentProduct,
  updateProduct,
  setFilters,
  clearFilters,
  setPagination,
  setLoading,
  setError,
} = productSlice.actions

export default productSlice.reducer
