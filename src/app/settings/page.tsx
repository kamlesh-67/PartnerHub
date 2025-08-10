'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  Bell, 
  Mail, 
  Shield, 
  Eye,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react'
import { type UserRole } from '@/lib/permissions'

interface UserSettings {
  id: string
  // Notification Settings
  emailNotifications: boolean
  orderUpdates: boolean
  marketingEmails: boolean
  securityAlerts: boolean
  
  // Privacy Settings
  profileVisibility: 'public' | 'company' | 'private'
  showEmail: boolean
  showPhone: boolean
  
  // Display Settings
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  itemsPerPage: number
  
  // Communication Preferences
  preferredContactMethod: 'email' | 'phone' | 'both'
  weeklyDigest: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const userRole = session?.user?.role as UserRole

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchSettings()
  }, [session, status, router])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || getDefaultSettings())
      } else {
        // If no settings exist, use defaults
        setSettings(getDefaultSettings())
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setSettings(getDefaultSettings())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSettings = (): UserSettings => ({
    id: 'default',
    // Notification Settings
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'company',
    showEmail: false,
    showPhone: false,
    
    // Display Settings
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    itemsPerPage: 10,
    
    // Communication Preferences
    preferredContactMethod: 'email',
    weeklyDigest: true
  })

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        // Settings saved successfully
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || !settings) {
    return null
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground">
            Manage your preferences and account configuration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about order status changes
                </p>
              </div>
              <Switch
                checked={settings.orderUpdates}
                onCheckedChange={(checked) => updateSetting('orderUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Important security notifications
                </p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => updateSetting('securityAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Product updates and promotional content
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly summary of your activity
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy</span>
            </CardTitle>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value: 'public' | 'company' | 'private') => 
                  updateSetting('profileVisibility', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="company">Company Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Who can see your profile information
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Email Address</Label>
                <p className="text-sm text-muted-foreground">
                  Display email in your profile
                </p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => updateSetting('showEmail', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Phone Number</Label>
                <p className="text-sm text-muted-foreground">
                  Display phone in your profile
                </p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => updateSetting('showPhone', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Contact Method</Label>
              <Select
                value={settings.preferredContactMethod}
                onValueChange={(value: 'email' | 'phone' | 'both') => 
                  updateSetting('preferredContactMethod', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Display</span>
            </CardTitle>
            <CardDescription>
              Customize your interface and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  updateSetting('theme', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value: string) => updateSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value: string) => updateSetting('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemsPerPage">Items Per Page</Label>
              <Input
                id="itemsPerPage"
                type="number"
                min="5"
                max="100"
                value={settings.itemsPerPage}
                onChange={(e) => updateSetting('itemsPerPage', parseInt(e.target.value) || 10)}
              />
              <p className="text-sm text-muted-foreground">
                Number of items to display in lists and tables
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your current account details and role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{session.user?.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <Badge className="mt-1">
                  {userRole?.replace('_', ' ')}
                </Badge>
              </div>
              {session.user?.company && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Company</Label>
                  <p className="text-sm text-muted-foreground">{typeof session.user.company === 'string' ? session.user.company : session.user.company?.name || 'N/A'}</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Actions</Label>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/profile')}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/profile#security')}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Changes Bar */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="font-medium">Settings</p>
            <p className="text-sm text-muted-foreground">
              Make sure to save your changes before leaving this page
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchSettings}>
              Reset to Default
            </Button>
            <Button onClick={handleSaveSettings} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}