'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { logError } from '@/lib/security'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        logError('global-error-boundary', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Something went wrong!</CardTitle>
                    <CardDescription>
                        We apologize for the inconvenience. A technical error has occurred.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4 italic">
                        "Something went wrong. Please try again."
                    </div>
                    <p className="text-gray-600 text-sm">
                        Our team has been notified. You can try refreshing the page or going back to the dashboard.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    <Button onClick={() => reset()} className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Try again
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        Go Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
