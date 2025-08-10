'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings,
  Database,
  Mail,
  Shield,
  Globe,
  Zap,
  Bell,
  Users,
  Building2,
  Package,
  CreditCard,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'

interface SystemSettings {
  platform: {
    siteName: string
    siteUrl: string
    adminEmail: string
    timezone: string
    currency: string
    language: string
    maintenanceMode: boolean
  }
  authentication: {
    requireEmailVerification: boolean
    allowUserRegistration: boolean
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorAuth: boolean
  }
  business: {
    defaultTaxRate: number
    shippingCalculation: 'flat' | 'weight' | 'zone'
    autoApproveOrders: boolean
    autoApproveCompanies: boolean
    minimumOrderAmount: number
    allowGuestCheckout: boolean
  }
  notifications: {
    emailNewUser: boolean
    emailNewOrder: boolean
    emailLowStock: boolean
    emailSystemAlerts: boolean
    smsEnabled: boolean
    pushEnabled: boolean
  }
  integrations: {
    paymentGateway: string
    shippingProvider: string
    analyticsEnabled: boolean
    backupEnabled: boolean
    apiRateLimit: number
  }
  security: {
    sslEnabled: boolean
    corsEnabled: boolean
    rateLimitEnabled: boolean
    ipWhitelistEnabled: boolean
    auditLogEnabled: boolean
    dataEncryption: boolean
  }
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Mock settings data (in a real app, this would come from an API)
  const mockSettings: SystemSettings = {
    platform: {
      siteName: 'PartnerHub Portal',
      siteUrl: 'https://b2b.company.com',
      adminEmail: 'admin@company.com',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en',
      maintenanceMode: false
    },
    authentication: {
      requireEmailVerification: true,
      allowUserRegistration: true,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      twoFactorAuth: false
    },
    business: {
      defaultTaxRate: 8.5,
      shippingCalculation: 'weight',
      autoApproveOrders: false,
      autoApproveCompanies: false,
      minimumOrderAmount: 100,
      allowGuestCheckout: false
    },
    notifications: {
      emailNewUser: true,
      emailNewOrder: true,
      emailLowStock: true,
      emailSystemAlerts: true,
      smsEnabled: false,
      pushEnabled: true
    },
    integrations: {
      paymentGateway: 'stripe',
      shippingProvider: 'fedex',
      analyticsEnabled: true,
      backupEnabled: true,
      apiRateLimit: 1000
    },
    security: {
      sslEnabled: true,
      corsEnabled: true,
      rateLimitEnabled: true,
      ipWhitelistEnabled: false,
      auditLogEnabled: true,
      dataEncryption: true
    }
  }

  // Handle authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Only Super Admins can access system settings
    if (session.user.role !== 'SUPER_ADMIN') {
      router.push('/')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    // Fetch system settings
    const fetchSettings = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSettings(mockSettings)
      } catch (error) {
        console.error('Error fetching settings:', error)
        setSettings(mockSettings)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'SUPER_ADMIN') {
      fetchSettings()
    }
  }, [session])

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      // In a real app, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    })
  }

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!session || !settings) {
    return null
  }

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' }
  ]

  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'INR', label: 'Indian Rupee (₹)' }
  ]

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform settings and preferences
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Saved successfully
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Save failed
            </div>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Portal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Portal Settings
            </CardTitle>
            <CardDescription>Basic platform configuration and branding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.platform.siteName}
                  onChange={(e) => updateSettings('platform', 'siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={settings.platform.siteUrl}
                  onChange={(e) => updateSettings('platform', 'siteUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.platform.adminEmail}
                  onChange={(e) => updateSettings('platform', 'adminEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={settings.platform.timezone} 
                  onValueChange={(value) => updateSettings('platform', 'timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select 
                  value={settings.platform.currency} 
                  onValueChange={(value) => updateSettings('platform', 'currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode" className="text-base font-medium">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable site access for updates</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.platform.maintenanceMode}
                onCheckedChange={(checked) => updateSettings('platform', 'maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Authentication & Security
            </CardTitle>
            <CardDescription>User authentication and security policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={settings.authentication.passwordMinLength}
                  onChange={(e) => updateSettings('authentication', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (days)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="90"
                  value={settings.authentication.sessionTimeout}
                  onChange={(e) => updateSettings('authentication', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.authentication.maxLoginAttempts}
                  onChange={(e) => updateSettings('authentication', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify their email before accessing the platform</p>
                </div>
                <Switch
                  checked={settings.authentication.requireEmailVerification}
                  onCheckedChange={(checked) => updateSettings('authentication', 'requireEmailVerification', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                </div>
                <Switch
                  checked={settings.authentication.allowUserRegistration}
                  onCheckedChange={(checked) => updateSettings('authentication', 'allowUserRegistration', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Enable 2FA for all admin users</p>
                </div>
                <Switch
                  checked={settings.authentication.twoFactorAuth}
                  onCheckedChange={(checked) => updateSettings('authentication', 'twoFactorAuth', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Business Configuration
            </CardTitle>
            <CardDescription>Commerce and business rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  value={settings.business.defaultTaxRate}
                  onChange={(e) => updateSettings('business', 'defaultTaxRate', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
                <Input
                  id="minimumOrderAmount"
                  type="number"
                  min="0"
                  value={settings.business.minimumOrderAmount}
                  onChange={(e) => updateSettings('business', 'minimumOrderAmount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingCalculation">Shipping Calculation</Label>
                <Select 
                  value={settings.business.shippingCalculation} 
                  onValueChange={(value) => updateSettings('business', 'shippingCalculation', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="weight">By Weight</SelectItem>
                    <SelectItem value="zone">By Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-approve Orders</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve orders without manual review</p>
                </div>
                <Switch
                  checked={settings.business.autoApproveOrders}
                  onCheckedChange={(checked) => updateSettings('business', 'autoApproveOrders', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-approve Companies</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new company registrations</p>
                </div>
                <Switch
                  checked={settings.business.autoApproveCompanies}
                  onCheckedChange={(checked) => updateSettings('business', 'autoApproveCompanies', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Allow Guest Checkout</Label>
                  <p className="text-sm text-muted-foreground">Allow users to checkout without creating an account</p>
                </div>
                <Switch
                  checked={settings.business.allowGuestCheckout}
                  onCheckedChange={(checked) => updateSettings('business', 'allowGuestCheckout', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email: New User Registration</Label>
                  <p className="text-sm text-muted-foreground">Notify admins when new users register</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNewUser}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailNewUser', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email: New Orders</Label>
                  <p className="text-sm text-muted-foreground">Notify admins of new order placements</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNewOrder}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailNewOrder', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Email: Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notify when products are running low</p>
                </div>
                <Switch
                  checked={settings.notifications.emailLowStock}
                  onCheckedChange={(checked) => updateSettings('notifications', 'emailLowStock', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable SMS notifications for critical alerts</p>
                </div>
                <Switch
                  checked={settings.notifications.smsEnabled}
                  onCheckedChange={(checked) => updateSettings('notifications', 'smsEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable browser push notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.pushEnabled}
                  onCheckedChange={(checked) => updateSettings('notifications', 'pushEnabled', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Advanced Security
            </CardTitle>
            <CardDescription>Advanced security and compliance settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.security).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <Badge variant={value ? 'default' : 'secondary'} className="ml-2">
                      {value ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => updateSettings('security', key, checked)}
                  />
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <div className="flex items-start space-x-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Security Recommendations</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    For maximum security, enable SSL, rate limiting, audit logging, and data encryption. 
                    Consider enabling IP whitelisting for admin access.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}