'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { MainLayout } from '@/components/organisms/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { FileText, PenSquare, Clock, CheckCircle, XCircle, Upload } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const stats = [
    { name: 'Total Documents', value: '24', icon: FileText, color: 'bg-blue-500' },
    { name: 'Pending Signatures', value: '8', icon: PenSquare, color: 'bg-yellow-500' },
    { name: 'Completed', value: '14', icon: CheckCircle, color: 'bg-green-500' },
    { name: 'Rejected', value: '2', icon: XCircle, color: 'bg-red-500' },
  ]

  const recentDocuments = [
    { id: 1, title: 'Employment Contract 2024', status: 'pending', date: '2024-01-15' },
    { id: 2, title: 'NDA - Client ABC', status: 'signed', date: '2024-01-14' },
    { id: 3, title: 'Service Agreement', status: 'pending', date: '2024-01-13' },
    { id: 4, title: 'Invoice #1234', status: 'signed', date: '2024-01-12' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <Button onClick={() => router.push('/documents/upload')}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name}>
                <CardContent className="flex items-center p-6">
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your latest document activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doc.status === 'signed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Quick Sign</CardTitle>
              <CardDescription className="text-blue-700">
                Sign documents waiting for your signature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Pending Documents</Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-900">Request Signature</CardTitle>
              <CardDescription className="text-purple-700">
                Send documents to others for signing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Start New Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}