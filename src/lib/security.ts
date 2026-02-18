import crypto from 'crypto'

/**
 * List of allowed internal redirect paths.
 * Prevent "Open Redirect" vulnerabilities.
 */
export const ALLOWED_REDIRECT_PATHS = [
    '/',
    '/dashboard',
    '/products',
    '/cart',
    '/checkout',
    '/profile',
    '/settings',
    '/myorders',
    '/auth/signin',
    '/auth/register',
    '/admin/dashboard',
    '/admin/orders',
    '/admin/products',
    '/company/dashboard',
    '/operations/dashboard',
]

/**
 * Validates a redirect URL against an allowlist.
 * @param url The target URL to validate
 * @param defaultPath The safe default to use if validation fails
 * @returns A safe URL string
 */
export function validateRedirectUrl(url: string | null | undefined, defaultPath = '/dashboard'): string {
    if (!url) return defaultPath

    // Check if it's an absolute internal path
    if (url.startsWith('/') && !url.startsWith('//')) {
        // Basic prefix matching or exact matching
        const isAllowed = ALLOWED_REDIRECT_PATHS.some((path) =>
            url === path || url.startsWith(path + '/') || url.startsWith(path + '?')
        )
        return isAllowed ? url : defaultPath
    }

    // If it's an external URL, reject it
    return defaultPath
}

/**
 * Verifies an HMAC-SHA256 signature for webhooks.
 * Prevents "Webhook Spoofing" and "Timing Attacks".
 */
export function verifyWebhookSignature(
    rawBody: string,
    signature: string | null,
    secret: string | undefined
): boolean {
    if (!signature || !secret) return false

    try {
        const hmac = crypto.createHmac('sha256', secret)
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
        const signatureBuffer = Buffer.from(signature, 'utf8')

        if (digest.length !== signatureBuffer.length) {
            return false
        }

        return crypto.timingSafeEqual(digest, signatureBuffer)
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Signature verification error:', error)
        }
        return false
    }
}

/**
 * Generic error logger that avoids leaking sensitive info.
 */
export function logError(context: string, error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[${context}] Error:`, error)
    } else {
        // TODO: Integrate with Sentry, Pino, or Datadog
        // Example: Sentry.captureException(error);
    }
}
