import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuditLogData {
  action: string
  resource: string
  resourceId: string
  userId: string
  userEmail: string
  userName: string
  details?: Record<string, unknown>
  severity?: 'info' | 'warning' | 'error' | 'critical'
  category?: 'authentication' | 'user_management' | 'system' | 'data' | 'security'
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        details: data.details,
        severity: data.severity || 'info',
        category: data.category || 'system',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    })

    return auditLog
  } catch (error) {
    console.error('Error creating audit log:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

export function getClientInfo(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent')

  const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

  return {
    ipAddress,
    userAgent: userAgent || 'unknown'
  }
}