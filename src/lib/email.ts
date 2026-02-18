import prisma from '@/lib/prisma'

interface EmailData {
  to: string | string[]
  templateName: string
  variables?: Record<string, unknown>
  from?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendEmail(data: EmailData): Promise<EmailResult> {
  try {
    // Fetch email template
    const template = await prisma.emailTemplate.findFirst({
      where: {
        name: data.templateName,
        isActive: true
      }
    })

    if (!template) {
      throw new Error(`Email template '${data.templateName}' not found or inactive`)
    }

    // Process template variables
    const processedSubject = processTemplate(template.subject, data.variables || {})
    const processedBody = processTemplate(template.body, data.variables || {})

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer with SMTP

    // For now, we'll simulate sending the email
    const result = await simulateEmailSend({
      to: Array.isArray(data.to) ? data.to : [data.to],
      from: data.from || 'noreply@partnerhub.com',
      subject: processedSubject,
      html: processedBody
    })

    return result

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error sending email:', error)
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function processTemplate(template: string, variables: Record<string, unknown>): string {
  let processed = template

  // Replace variables in format {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    processed = processed.replace(regex, String(value))
  })

  // Replace common system variables
  const systemVariables = {
    currentYear: new Date().getFullYear(),
    currentDate: new Date().toLocaleDateString(),
    siteName: 'PartnerHub',
    supportEmail: 'support@partnerhub.com'
  }

  Object.entries(systemVariables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    processed = processed.replace(regex, String(value))
  })

  return processed
}

// Simulate email sending (replace with real implementation)
async function simulateEmailSend(emailData: {
  to: string[]
  from: string
  subject: string
  html: string
}): Promise<EmailResult> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Simulate success/failure (95% success rate)
  const success = Math.random() > 0.05

  if (success) {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📧 Email sent successfully:`, {
        ...emailData,
        messageId,
        timestamp: new Date().toISOString()
      })
    }

    return {
      success: true,
      messageId
    }
  } else {
    return {
      success: false,
      error: 'SMTP server temporarily unavailable'
    }
  }
}

// Predefined email templates for common scenarios
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order_confirmation',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  LOW_STOCK_ALERT: 'low_stock_alert',
  USER_WELCOME: 'user_welcome',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_LOCKED: 'account_locked',
  BULK_ORDER_REQUEST: 'bulk_order_request'
}

// Quick send functions for common scenarios
export async function sendOrderConfirmation(userEmail: string, orderData: Record<string, unknown>) {
  return sendEmail({
    to: userEmail,
    templateName: EMAIL_TEMPLATES.ORDER_CONFIRMATION,
    variables: {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      orderTotal: orderData.total,
      orderItems: orderData.items,
      shippingAddress: orderData.shippingAddress,
      estimatedDelivery: orderData.estimatedDelivery
    }
  })
}

export async function sendPaymentSuccess(userEmail: string, paymentData: Record<string, unknown>) {
  return sendEmail({
    to: userEmail,
    templateName: EMAIL_TEMPLATES.PAYMENT_SUCCESS,
    variables: {
      customerName: paymentData.customerName,
      orderNumber: paymentData.orderNumber,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionId: paymentData.transactionId
    }
  })
}

export async function sendLowStockAlert(adminEmails: string[], productData: Record<string, unknown>) {
  return sendEmail({
    to: adminEmails,
    templateName: EMAIL_TEMPLATES.LOW_STOCK_ALERT,
    variables: {
      productName: productData.name,
      productSku: productData.sku,
      currentStock: productData.stock,
      minStock: productData.minStock,
      productUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${productData.slug}`
    }
  })
}

export async function sendUserWelcome(userEmail: string, userData: Record<string, unknown>) {
  return sendEmail({
    to: userEmail,
    templateName: EMAIL_TEMPLATES.USER_WELCOME,
    variables: {
      userName: userData.name,
      userEmail: userData.email,
      companyName: userData.companyName,
      loginUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signin`
    }
  })
}