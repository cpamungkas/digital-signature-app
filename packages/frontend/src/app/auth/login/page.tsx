'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { AuthForm } from '@/components/molecules/AuthForm'
import { Input } from '@/components/atoms/Input'
import { FormError } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormError[]>([])

  const validateForm = (): boolean => {
    const newErrors: FormError[] = []

    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' })
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' })
    } else if (formData.password.length < 6) {
      newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error) {
      setErrors([
        {
          field: 'form',
          message: error instanceof Error ? error.message : 'Login failed',
        },
      ])
    }
  }

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <AuthForm
        title="Sign In"
        description="Enter your credentials to access your account"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        footerContent={
          <div className="space-y-2 text-center">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
            <Link href="/auth/forgot-password" className="text-sm text-muted-foreground hover:underline">
              Forgot password?
            </Link>
          </div>
        }
      >
        {errors.find((e) => e.field === 'form') && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.find((e) => e.field === 'form')?.message}
          </div>
        )}
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={getFieldError('email')}
          disabled={isLoading}
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={getFieldError('password')}
          disabled={isLoading}
        />
      </AuthForm>
    </div>
  )
}