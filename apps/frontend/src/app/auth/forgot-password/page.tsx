'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/molecules/AuthForm'
import { Input } from '@/components/atoms/Input'
import { FormError } from '@/types'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/atoms/Button'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormError[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormError[] = []

    if (!email) {
      newErrors.push({ field: 'email', message: 'Email is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch (error) {
      setErrors([
        {
          field: 'form',
          message: error instanceof Error ? error.message : 'Failed to send reset link',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mb-6 text-gray-500">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </p>
          <Button className="w-full" onClick={() => router.push('/auth/login')}>
            Back to Login
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Didn't receive the email?{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <AuthForm
        title="Reset Password"
        description="Enter your email to receive a password reset link"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        footerContent={
          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        }
      >
        {errors.find((e) => e.field === 'form') && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.find((e) => e.field === 'form')?.message}
          </div>
        )}
        <Input
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={getFieldError('email')}
          disabled={isLoading}
          helperText="We'll send you a link to reset your password"
        />
      </AuthForm>
    </div>
  )
}