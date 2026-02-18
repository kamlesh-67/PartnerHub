import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'



// GET - Fetch email templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can manage email templates
    if (!['SUPER_ADMIN', 'ACCOUNT_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: Record<string, unknown> = {}
    
    if (name) {
      where.name = name
    }

    if (activeOnly) {
      where.isActive = true
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST - Create email template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, body: templateBody, variables, isActive = true } = body

    if (!name || !subject || !templateBody) {
      return NextResponse.json({ error: 'Name, subject, and body are required' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        variables,
        isActive
      }
    })

    return NextResponse.json({ template, message: 'Email template created successfully' }, { status: 201 })

  } catch (error: unknown) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Template name already exists' }, { status: 400 })
    }
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT - Update email template
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { subject, body: templateBody, variables, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (subject) updateData.subject = subject
    if (templateBody) updateData.body = templateBody
    if (variables !== undefined) updateData.variables = variables
    if (isActive !== undefined) updateData.isActive = isActive

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: updateData
    })

    return NextResponse.json({ template, message: 'Email template updated successfully' })

  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE - Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    await prisma.emailTemplate.delete({
      where: { id: templateId }
    })

    return NextResponse.json({ message: 'Email template deleted successfully' })

  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}