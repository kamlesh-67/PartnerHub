import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface OrderItem {
  id: string
  productId: string
  name: string
  sku: string
  quantity: number
  price: number
  image?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  notes?: string
  userId: string
  companyId?: string
  shippingAddress: {
    id: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress: {
    id: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex(order => order.id === action.payload.id)
      if (index !== -1) {
        state.orders[index] = action.payload
      }
      if (state.currentOrder?.id === action.payload.id) {
        state.currentOrder = action.payload
      }
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
      if (state.currentOrder?.id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status
      }
    },
    setPagination: (state, action: PayloadAction<Partial<OrderState['pagination']>>) => {
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
  setOrders,
  setCurrentOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
  setPagination,
  setLoading,
  setError,
} = orderSlice.actions

export default orderSlice.reducer
