import { PrismaClient } from '@prisma/client'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

// Note: This script assumes you have updated schema.prisma to provider = "mongodb"
// and you have a valid DATABASE_URL in your .env pointing to MongoDB.

const prisma = new PrismaClient()
const dbPath = './prisma/dev.db'

async function migrate() {
    console.log('🚀 Starting migration from SQLite to MongoDB...')

    const sqlite = new sqlite3.Database(dbPath)
    const all = promisify(sqlite.all.bind(sqlite))

    try {
        // 1. Migrate Companies
        console.log('🏢 Migrating companies...')
        const companies = await all('SELECT * FROM companies') as any[]
        for (const company of companies) {
            await prisma.company.upsert({
                where: { id: company.id },
                update: {},
                create: {
                    ...company,
                    isActive: Boolean(company.isActive),
                    createdAt: new Date(company.createdAt),
                    updatedAt: new Date(company.updatedAt),
                }
            })
        }

        // 2. Migrate Categories
        console.log('📂 Migrating categories...')
        const categories = await all('SELECT * FROM categories') as any[]
        for (const cat of categories) {
            await prisma.category.upsert({
                where: { id: cat.id },
                update: {},
                create: {
                    ...cat,
                    isActive: Boolean(cat.isActive),
                    createdAt: new Date(cat.createdAt),
                    updatedAt: new Date(cat.updatedAt),
                }
            })
        }

        // 3. Migrate Users
        console.log('👥 Migrating users...')
        const users = await all('SELECT * FROM users') as any[]
        for (const user of users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    ...user,
                    isActive: Boolean(user.isActive),
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
                }
            })
        }

        // 4. Migrate Products
        console.log('🛍️ Migrating products...')
        const products = await all('SELECT * FROM products') as any[]
        for (const p of products) {
            await prisma.product.upsert({
                where: { id: p.id },
                update: {},
                create: {
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                }
            })
        }

        // 5. Migrate Addresses
        console.log('📍 Migrating addresses...')
        const addresses = await all('SELECT * FROM addresses') as any[]
        for (const addr of addresses) {
            await prisma.address.upsert({
                where: { id: addr.id },
                update: {},
                create: {
                    ...addr,
                    isDefault: Boolean(addr.isDefault),
                    createdAt: new Date(addr.createdAt),
                    updatedAt: new Date(addr.updatedAt),
                }
            })
        }

        // 6. Migrate Orders
        console.log('📦 Migrating orders...')
        const orders = await all('SELECT * FROM orders') as any[]
        for (const order of orders) {
            await prisma.order.upsert({
                where: { id: order.id },
                update: {},
                create: {
                    ...order,
                    createdAt: new Date(order.createdAt),
                    updatedAt: new Date(order.updatedAt),
                }
            })
        }

        // 7. Migrate Order Items
        console.log('📄 Migrating order items...')
        const orderItems = await all('SELECT * FROM order_items') as any[]
        for (const item of orderItems) {
            await prisma.orderItem.upsert({
                where: { id: item.id },
                update: {},
                create: item
            })
        }

        // 8. Migrate Inventory Transactions
        console.log('🔄 Migrating inventory transactions...')
        try {
            const transactions = await all('SELECT * FROM inventory_transactions') as any[]
            for (const tx of transactions) {
                await prisma.inventoryTransaction.upsert({
                    where: { id: tx.id },
                    update: {},
                    create: {
                        ...tx,
                        createdAt: new Date(tx.createdAt)
                    }
                })
            }
        } catch (e) { console.warn('Skipping inventory_transactions: table might not exist') }

        // 9. Migrate Audit Logs
        console.log('📜 Migrating audit logs...')
        try {
            const logs = await all('SELECT * FROM audit_logs') as any[]
            for (const log of logs) {
                await prisma.auditLog.upsert({
                    where: { id: log.id },
                    update: {},
                    create: {
                        ...log,
                        timestamp: new Date(log.timestamp),
                        createdAt: new Date(log.createdAt),
                        details: log.details ? JSON.parse(log.details) : null
                    }
                })
            }
        } catch (e) { console.warn('Skipping audit_logs: table might not exist') }

        // 10. Migrate Payment Records
        console.log('💳 Migrating payment records...')
        try {
            const payments = await all('SELECT * FROM payment_records') as any[]
            for (const p of payments) {
                await prisma.paymentRecord.upsert({
                    where: { id: p.id },
                    update: {},
                    create: {
                        ...p,
                        paidAt: p.paidAt ? new Date(p.paidAt) : null,
                        refundedAt: p.refundedAt ? new Date(p.refundedAt) : null,
                        createdAt: new Date(p.createdAt),
                        updatedAt: new Date(p.updatedAt),
                        gatewayData: p.gatewayData ? JSON.parse(p.gatewayData) : null
                    }
                })
            }
        } catch (e) { console.warn('Skipping payment_records: table might not exist') }

        // 11. Migrate Notifications
        console.log('🔔 Migrating notifications...')
        try {
            const notifications = await all('SELECT * FROM notifications') as any[]
            for (const n of notifications) {
                await prisma.notification.upsert({
                    where: { id: n.id },
                    update: {},
                    create: {
                        ...n,
                        isRead: Boolean(n.isRead),
                        isGlobal: Boolean(n.isGlobal),
                        metadata: n.metadata ? JSON.parse(n.metadata) : null,
                        createdAt: new Date(n.createdAt),
                        readAt: n.readAt ? new Date(n.readAt) : null,
                        expiresAt: n.expiresAt ? new Date(n.expiresAt) : null
                    }
                })
            }
        } catch (e) { console.warn('Skipping notifications: table might not exist') }

        console.log('✅ Migration completed successfully!')
    } catch (error) {
        console.error('❌ Migration failed:', error)
    } finally {
        sqlite.close()
        await prisma.$disconnect()
    }
}

migrate()
