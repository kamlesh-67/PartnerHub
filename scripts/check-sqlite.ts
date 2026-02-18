import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.count()
    const companies = await prisma.company.count()
    const products = await prisma.product.count()

    console.log('Current SQLite Data Stats:')
    console.log(`- Users: ${users}`)
    console.log(`- Companies: ${companies}`)
    console.log(`- Products: ${products}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
