import { useState, useCallback } from 'react'
import { Document, DocumentListResponse, PaginationParams } from '@/types'
import { useAuth } from '@/lib/context/AuthContext'

export function useDocuments() {
  const { session } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: false,
  })

  const fetchDocuments = useCallback(
    async (params: Partial<PaginationParams> = {}) => {
      if (!session?.token) return

      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams({
          page: String(params.page || pagination.page),
          pageSize: String(params.pageSize || pagination.pageSize),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.sortOrder && { sortOrder: params.sortOrder }),
        })

        // TODO: Replace with actual API call
        const response = await fetch(`/api/documents?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch documents')
        }

        const data: DocumentListResponse = await response.json()
        setDocuments(data.data)
        setPagination({
          page: data.page,
          pageSize: data.pageSize,
          total: data.total,
          hasMore: data.hasMore,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    },
    [session?.token, pagination.page, pagination.pageSize]
  )

  const getDocument = useCallback(
    async (id: string): Promise<Document | null> => {
      if (!session?.token) return null

      try {
        // TODO: Replace with actual API call
        const response = await fetch(`/api/documents/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch document')
        }

        return await response.json()
      } catch (err) {
        console.error('Error fetching document:', err)
        return null
      }
    },
    [session?.token]
  )

  const uploadDocument = useCallback(
    async (file: File, title: string, description?: string): Promise<Document | null> => {
      if (!session?.token) return null

      setIsLoading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', title)
        if (description) formData.append('description', description)

        // TODO: Replace with actual API call
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload document')
        }

        const newDocument: Document = await response.json()
        setDocuments((prev) => [newDocument, ...prev])
        return newDocument
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [session?.token]
  )

  return {
    documents,
    isLoading,
    error,
    pagination,
    fetchDocuments,
    getDocument,
    uploadDocument,
  }
}