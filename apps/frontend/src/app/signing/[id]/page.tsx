'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { MainLayout } from '@/components/organisms/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { FileText, PenTool, Check, X, Download } from 'lucide-react'

export default function SigningPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, isAuthenticated } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return

    // Save signature as base64
    const dataUrl = canvas.toDataURL('image/png')
    setSignatureData(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureData(null)
  }

  const handleSubmitSignature = async () => {
    if (!signatureData) {
      alert('Please provide your signature')
      return
    }

    // TODO: Submit signature to API
    console.log('Submitting signature:', signatureData)
    alert('Signature submitted successfully!')
    router.push('/documents')
  }

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

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sign Document</h1>
          <p className="text-gray-500">Review and sign the document below</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Document viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Employment Contract 2024
                </CardTitle>
                <CardDescription>Review the document before signing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="document-viewer h-[600px] bg-gray-100 p-4">
                  <div className="rounded bg-white p-8 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold">Employment Contract</h2>
                    <p className="mb-4 text-gray-700">
                      This Employment Contract is entered into on January 15, 2024, between...
                    </p>
                    <p className="mb-4 text-gray-700">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p className="text-gray-700">
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                      aliquip ex ea commodo consequat.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Your Signature
                </CardTitle>
                <CardDescription>Draw your signature below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white">
                  <canvas
                    ref={canvasRef}
                    className="signature-canvas h-48 w-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={clearSignature}>
                  Clear Signature
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium text-yellow-600">Pending Signature</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="font-medium">Jan 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">2.4 MB</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full" onClick={handleSubmitSignature}>
                <Check className="mr-2 h-4 w-4" />
                Sign Document
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/documents')}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button variant="ghost" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}