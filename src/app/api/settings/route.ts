import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog, getClientInfo } from '@/lib/audit'



// GET - Fetch system settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const publicOnly = searchParams.get('publicOnly') === 'true'
    const key = searchParams.get('key')

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (key) {
      where.key = key
    } else {
      if (category && category !== 'all') {
        where.category = category
      }

      // Non-admins can only see public settings
      if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role) || publicOnly) {
        where.isPublic = true
      }
    }

    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Parse values based on type
    const formattedSettings = settings.map(setting => ({
      ...setting,
      parsedValue: parseSettingValue(setting.value, setting.type)
    }))

    return NextResponse.json({ settings: formattedSettings })

  } catch (error: unknown) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST - Create new setting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      key,
      value,
      type = 'string',
      category = 'general',
      isPublic = false,
      description
    } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    // Validate value based on type
    const validatedValue = validateSettingValue(value, type)
    if (validatedValue === null) {
      return NextResponse.json({ error: `Invalid value for type ${type}` }, { status: 400 })
    }

    const setting = await prisma.systemSetting.create({
      data: {
        key,
        value: String(validatedValue),
        type,
        category,
        isPublic
      }
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'settings.create',
      resource: 'system_setting',
      resourceId: setting.id,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        key,
        value: String(validatedValue),
        type,
        category,
        isPublic
      },
      category: 'system',
      severity: 'info',
      ...clientInfo
    })

    return NextResponse.json({
      setting: {
        ...setting,
        parsedValue: parseSettingValue(setting.value, setting.type)
      },
      message: 'Setting created successfully'
    }, { status: 201 })

  } catch (error: unknown) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Setting key already exists' }, { status: 400 })
    }
    console.error('Error creating setting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT - Update setting
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const settingId = searchParams.get('id')
    const key = searchParams.get('key')

    if (!settingId && !key) {
      return NextResponse.json({ error: 'Setting ID or key required' }, { status: 400 })
    }

    const body = await request.json()
    const { value, type, category, isPublic } = body

    // Find existing setting
    const existingSetting = await prisma.systemSetting.findFirst({
      where: settingId ? { id: settingId } : { key: key! }
    })

    if (!existingSetting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    // Validate new value if provided
    let validatedValue = existingSetting.value
    if (value !== undefined) {
      validatedValue = validateSettingValue(value, type || existingSetting.type)
      if (validatedValue === null) {
        return NextResponse.json({ error: `Invalid value for type ${type || existingSetting.type}` }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (value !== undefined) updateData.value = String(validatedValue)
    if (type) updateData.type = type
    if (category) updateData.category = category
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const setting = await prisma.systemSetting.update({
      where: { id: existingSetting.id },
      data: updateData
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'settings.update',
      resource: 'system_setting',
      resourceId: setting.id,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        oldValues: {
          value: existingSetting.value,
          type: existingSetting.type,
          category: existingSetting.category,
          isPublic: existingSetting.isPublic
        },
        newValues: updateData,
        key: setting.key
      },
      category: 'system',
      severity: 'warning',
      ...clientInfo
    })

    return NextResponse.json({
      setting: {
        ...setting,
        parsedValue: parseSettingValue(setting.value, setting.type)
      },
      message: 'Setting updated successfully'
    })

  } catch (error: unknown) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Delete setting
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const settingId = searchParams.get('id')
    const key = searchParams.get('key')

    if (!settingId && !key) {
      return NextResponse.json({ error: 'Setting ID or key required' }, { status: 400 })
    }

    // Find and delete setting
    const setting = await prisma.systemSetting.findFirst({
      where: settingId ? { id: settingId } : { key: key! }
    })

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    await prisma.systemSetting.delete({
      where: { id: setting.id }
    })

    // Create audit log
    const clientInfo = getClientInfo(request)
    await createAuditLog({
      action: 'settings.delete',
      resource: 'system_setting',
      resourceId: setting.id,
      userId: session.user.id,
      userEmail: session.user.email || 'unknown@example.com',
      userName: session.user.name || 'Unknown User',
      details: {
        deletedSetting: {
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category
        }
      },
      category: 'system',
      severity: 'warning',
      ...clientInfo
    })

    return NextResponse.json({ message: 'Setting deleted successfully' })

  } catch (error: unknown) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Helper functions
function validateSettingValue(value: unknown, type: string) {
  switch (type) {
    case 'string':
      return String(value)
    case 'number':
      const num = Number(value)
      return isNaN(num) ? null : num
    case 'boolean':
      if (typeof value === 'boolean') return value
      if (value === 'true' || value === '1') return true
      if (value === 'false' || value === '0') return false
      return null
    case 'json':
      try {
        return typeof value === 'string' ? JSON.parse(value) : value
      } catch {
        return null
      }
    default:
      return String(value)
  }
}

function parseSettingValue(value: string, type: string) {
  switch (type) {
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}