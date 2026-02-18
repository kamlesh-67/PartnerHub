'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Mail, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (failedAttempts >= 3 && !captchaVerified) {
      toast.error('Please verify the CAPTCHA first.')
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const newFailCount = failedAttempts + 1
        setFailedAttempts(newFailCount)

        if (newFailCount >= 3) {
          setShowCaptcha(true)
          toast.error('Too many failed attempts. Please solve the CAPTCHA.')
        } else {
          toast.error(`Invalid credentials. ${3 - newFailCount} attempts remaining.`)
        }
      } else {
        toast.success('Welcome back!')
        const session = await getSession()

        // Redirect based on user role
        if (session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard')
        } else if (session?.user?.role === 'ACCOUNT_ADMIN') {
          router.push('/admin/company')
        } else if (session?.user?.role === 'OPERATION') {
          router.push('/operations/dashboard')
        } else {
          router.push('/products')
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Building2 className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your B2B account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your B2B commerce account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading || (failedAttempts >= 3 && !captchaVerified)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading || (failedAttempts >= 3 && !captchaVerified)}
                  />
                </div>
              </div>

              {showCaptcha && !captchaVerified && (
                <div className="p-4 bg-secondary/50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Security Verification</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="captcha"
                      onChange={(e) => setCaptchaVerified(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="captcha" className="text-sm cursor-pointer">I am not a robot</Label>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || (failedAttempts >= 3 && !captchaVerified)}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don&apos;t have an account? </span>
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="px-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>Contact your administrator for account access</span>
          </div>
        </div>
      </div>
    </div>
  )
}
