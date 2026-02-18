import { z } from 'zod'

export const orderSchema = z.object({
    shippingAddressId: z.string().min(1, "Shipping address is required"),
    billingAddressId: z.string().min(1, "Billing address is required"),
    notes: z.string().optional(),
    paymentMethod: z.enum(['credit_card', 'bank_transfer', 'cod']).default('credit_card'),
    paymentToken: z.string().optional(),
})

export const orderStatusUpdateSchema = z.object({
    id: z.string().min(1, "Order ID is required"),
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    notes: z.string().optional(),
})

export const productSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    price: z.number().positive(),
    sku: z.string().min(3),
    categoryId: z.string().min(1),
    stock: z.number().int().min(0),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
})

export const userUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    role: z.enum(['SUPER_ADMIN', 'ACCOUNT_ADMIN', 'BUYER', 'OPERATION']).optional(),
    isActive: z.boolean().optional(),
})
