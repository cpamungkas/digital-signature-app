'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { MainLayout } from '@/components/organisms/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { FileText, Upload, Download, MoreHorizontal, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function DocumentsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [documents, setDocuments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

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

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    archived: 'bg-gray-200 text-gray-600',
  }

  const documentsData = [
    { id: 1, title: 'Employment Contract 2024', status: 'pending', date: '2024-01-15', size: '2.4 MB' },
    { id: 2, title: 'NDA - Client ABC', status: 'signed', date: '2024-01-14', size: '1.2 MB' },
    { id: 3, title: 'Service Agreement', status: 'pending', date: '2024-01-13', size: '3.1 MB' },
    { id: 4, title: 'Invoice #1234', status: 'signed', date: '2024-01-12', size: '542 KB' },
    { id: 5, title: 'Project Proposal', status: 'draft', date: '2024-01-11', size: '4.8 MB' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-500">Manage your documents and signing requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/documents/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setFilterStatus('all')}>
                  <Filter className="mr-2 h-4 w-4" />
                  All
                </Button>
                <Button variant="outline" onClick={() => setFilterStatus('pending')}>
                  Pending
                </Button>
                <Button variant="outline" onClick={() => setFilterStatus('signed')}>
                  Signed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents list */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>Manage and track your document signing process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="pb-3 font-medium">Document</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Size</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documentsData.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            <p className="text-xs text-gray-500">Uploaded by you</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            statusColors[doc.status as keyof typeof statusColors]
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{doc.date}</td>
                      <td className="py-4 text-gray-500">{doc.size}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}