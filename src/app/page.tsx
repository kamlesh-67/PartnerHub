'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Package, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()

  const features = [
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access control with Super Admin, Account Admin, Buyer, and Operations roles'
    },
    {
      icon: Building2,
      title: 'Multi-Company Support',
      description: 'Manage multiple companies and their users in a single platform'
    },
    {
      icon: ShoppingCart,
      title: 'Advanced Commerce',
      description: 'Full-featured B2B commerce with cart, orders, and inventory management'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics and reporting for business insights'
    }
  ]

  const getRoleDashboard = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard'
      case 'ACCOUNT_ADMIN':
        return '/admin/company'
      case 'OPERATION':
        return '/operations/dashboard'
      default:
        return '/products'
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PartnerHub Portal
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Modern partner commerce solution with role-based access control, 
            multi-company support, and advanced features for enterprise needs.
          </p>

          {session ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  Welcome back, {session.user.name}
                </Badge>
                <Badge className="text-sm">
                  {session.user.role.replace('_', ' ')}
                </Badge>
              </div>
              <Button asChild size="lg">
                <Link href="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Ready Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and best practices for scalable B2B commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
