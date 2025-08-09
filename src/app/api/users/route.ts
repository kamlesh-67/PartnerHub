import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view users
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ACCOUNT_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const company = searchParams.get('company') || 'all'

    // Build where clause based on user role and filters
    const whereClause: Record<string, unknown> = {}

    // If user is ACCOUNT_ADMIN, only show users from their company
    if (session.user.role === 'ACCOUNT_ADMIN') {
      whereClause.company = {
        name: session.user.company
      }
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Add role filter
    if (role !== 'all') {
      whereClause.role = role
    }

    // Add company filter (only for SUPER_ADMIN)
    if (company !== 'all' && session.user.role === 'SUPER_ADMIN') {
      whereClause.company = {
        name: company
      }
    }

    // Fetch users from database
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name
      } : {
        id: 'unknown',
        name: 'No Company'
      },
      phone: undefined, // Phone field doesn't exist in schema
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString()
    }))

    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
