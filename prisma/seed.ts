import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create companies
  const companies = [
    {
      name: 'PUMS',
      email: 'contact@pums.com',
      phone: '+1-555-0101',
      website: 'https://pums.com',
      taxId: 'TAX-PUMS-001',
      description: 'Premium fashion and lifestyle brand'
    },
    {
      name: 'Prada',
      email: 'contact@prada.com',
      phone: '+1-555-0102',
      website: 'https://prada.com',
      taxId: 'TAX-PRADA-001',
      description: 'Luxury Italian fashion house'
    },
    {
      name: 'Chanel',
      email: 'contact@chanel.com',
      phone: '+1-555-0103',
      website: 'https://chanel.com',
      taxId: 'TAX-CHANEL-001',
      description: 'French luxury fashion house'
    },
    {
      name: 'Adidas',
      email: 'contact@adidas.com',
      phone: '+1-555-0104',
      website: 'https://adidas.com',
      taxId: 'TAX-ADIDAS-001',
      description: 'German multinational corporation that designs and manufactures shoes, clothing and accessories'
    }
  ]

  console.log('📦 Creating companies...')
  const createdCompanies = []
  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { email: companyData.email },
      update: {},
      create: companyData
    })
    createdCompanies.push(company)
    console.log(`✅ Created company: ${company.name}`)
  }

  // Create categories
  console.log('📂 Creating product categories...')
  const categories = [
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Fashion and apparel items'
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Shoes and footwear'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories and luxury items'
    },
    {
      name: 'Sportswear',
      slug: 'sportswear',
      description: 'Athletic and sports apparel'
    }
  ]

  const createdCategories = []
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData
    })
    createdCategories.push(category)
    console.log(`✅ Created category: ${category.name}`)
  }

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create Super Admin
  console.log('👑 Creating Super Admin...')
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@b2bcommerce.com' },
    update: {},
    create: {
      email: 'admin@b2bcommerce.com',
      name: 'Super Administrator',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  })
  console.log(`✅ Created Super Admin: ${superAdmin.name}`)

  // Create Operation users
  console.log('⚙️ Creating Operation users...')
  const operationUsers = [
    {
      email: 'operations@b2bcommerce.com',
      name: 'Operations Manager',
    },
    {
      email: 'warehouse@b2bcommerce.com',
      name: 'Warehouse Manager',
    }
  ]

  for (const userData of operationUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        role: 'OPERATION',
        isActive: true
      }
    })
    console.log(`✅ Created Operation user: ${user.name}`)
  }

  // Create Account Admins and Buyers for each company
  console.log('🏢 Creating company users...')
  for (const company of createdCompanies) {
    // Create Account Admin for each company
    const accountAdmin = await prisma.user.upsert({
      where: { email: `admin@${company.name.toLowerCase()}.com` },
      update: {},
      create: {
        email: `admin@${company.name.toLowerCase()}.com`,
        name: `${company.name} Account Admin`,
        password: hashedPassword,
        role: 'ACCOUNT_ADMIN',
        companyId: company.id,
        isActive: true
      }
    })
    console.log(`✅ Created Account Admin for ${company.name}: ${accountAdmin.name}`)

    // Create multiple buyers for each company
    const buyers = [
      {
        email: `buyer1@${company.name.toLowerCase()}.com`,
        name: `${company.name} Buyer 1`,
      },
      {
        email: `buyer2@${company.name.toLowerCase()}.com`,
        name: `${company.name} Buyer 2`,
      },
      {
        email: `procurement@${company.name.toLowerCase()}.com`,
        name: `${company.name} Procurement Manager`,
      }
    ]

    for (const buyerData of buyers) {
      const buyer = await prisma.user.upsert({
        where: { email: buyerData.email },
        update: {},
        create: {
          ...buyerData,
          password: hashedPassword,
          role: 'BUYER',
          companyId: company.id,
          isActive: true
        }
      })
      console.log(`✅ Created Buyer for ${company.name}: ${buyer.name}`)
    }

    // Create addresses for each company
    const addresses = [
      {
        street: `${company.name} Headquarters, 123 Business Ave`,
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        type: 'billing',
        isDefault: true,
        companyId: company.id
      },
      {
        street: `${company.name} Warehouse, 456 Industrial Blvd`,
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        type: 'shipping',
        isDefault: false,
        companyId: company.id
      }
    ]

    for (const addressData of addresses) {
      await prisma.address.create({
        data: addressData
      })
    }
    console.log(`✅ Created addresses for ${company.name}`)
  }

  // Create sample products
  console.log('🛍️ Creating sample products...')
  const products = [
    {
      name: 'Premium Business Suit',
      slug: 'premium-business-suit',
      description: 'High-quality business suit perfect for professional settings',
      shortDescription: 'Premium business suit',
      sku: 'SUIT-001',
      price: 899.99,
      comparePrice: 1199.99,
      costPrice: 450.00,
      stock: 50,
      categoryId: createdCategories.find(c => c.slug === 'fashion')?.id!,
      images: JSON.stringify(['/images/suit-1.jpg', '/images/suit-2.jpg']),
      tags: JSON.stringify(['business', 'formal', 'premium'])
    },
    {
      name: 'Luxury Leather Handbag',
      slug: 'luxury-leather-handbag',
      description: 'Exquisite leather handbag crafted with premium materials',
      shortDescription: 'Luxury leather handbag',
      sku: 'BAG-001',
      price: 1299.99,
      comparePrice: 1599.99,
      costPrice: 650.00,
      stock: 25,
      categoryId: createdCategories.find(c => c.slug === 'accessories')?.id!,
      images: JSON.stringify(['/images/handbag-1.jpg', '/images/handbag-2.jpg']),
      tags: JSON.stringify(['luxury', 'leather', 'handbag'])
    },
    {
      name: 'Athletic Running Shoes',
      slug: 'athletic-running-shoes',
      description: 'High-performance running shoes for athletes and fitness enthusiasts',
      shortDescription: 'Athletic running shoes',
      sku: 'SHOES-001',
      price: 159.99,
      comparePrice: 199.99,
      costPrice: 80.00,
      stock: 100,
      categoryId: createdCategories.find(c => c.slug === 'footwear')?.id!,
      images: JSON.stringify(['/images/shoes-1.jpg', '/images/shoes-2.jpg']),
      tags: JSON.stringify(['athletic', 'running', 'sports'])
    },
    {
      name: 'Performance Sports Jersey',
      slug: 'performance-sports-jersey',
      description: 'Moisture-wicking sports jersey for optimal performance',
      shortDescription: 'Performance sports jersey',
      sku: 'JERSEY-001',
      price: 79.99,
      comparePrice: 99.99,
      costPrice: 35.00,
      stock: 75,
      categoryId: createdCategories.find(c => c.slug === 'sportswear')?.id!,
      images: JSON.stringify(['/images/jersey-1.jpg', '/images/jersey-2.jpg']),
      tags: JSON.stringify(['sports', 'jersey', 'performance'])
    }
  ]

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData
    })
    console.log(`✅ Created product: ${product.name}`)
  }

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`- Companies: ${createdCompanies.length}`)
  console.log(`- Categories: ${createdCategories.length}`)
  console.log(`- Products: ${products.length}`)
  console.log(`- Users: 1 Super Admin + 2 Operations + ${createdCompanies.length * 4} Company Users`)
  
  console.log('\n🔑 Login Credentials (password: password123):')
  console.log('Super Admin: admin@b2bcommerce.com')
  console.log('Operations: operations@b2bcommerce.com, warehouse@b2bcommerce.com')
  console.log('\nCompany Users:')
  for (const company of createdCompanies) {
    console.log(`${company.name}:`)
    console.log(`  - Account Admin: admin@${company.name.toLowerCase()}.com`)
    console.log(`  - Buyers: buyer1@${company.name.toLowerCase()}.com, buyer2@${company.name.toLowerCase()}.com, procurement@${company.name.toLowerCase()}.com`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
