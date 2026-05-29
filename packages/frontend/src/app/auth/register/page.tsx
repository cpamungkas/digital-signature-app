'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { AuthForm } from '@/components/molecules/AuthForm'
import { Input } from '@/components/atoms/Input'
import { FormError } from '@/types'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormError[]>([])

  const validateForm = (): boolean => {
    const newErrors: FormError[] = []

    if (!formData.name) {
      newErrors.push({ field: 'name', message: 'Name is required' })
    }

    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' })
    }

    if (!formData.password) {
      newErrors.push({ field: 'password', message: 'Password is required' })
    } else if (formData.password.length < 8) {
      newErrors.push({ field: 'password', message: 'Password must be at least 8 characters' })
    }

    if (!formData.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Please confirm your password' })
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await register(formData.email, formData.password, formData.name)
      router.push('/dashboard')
    } catch (error) {
      setErrors([
        {
          field: 'form',
          message: error instanceof Error ? error.message : 'Registration failed',
        },
      ])
    }
  }

  const getFieldError = (field: string) => errors.find((e) => e.field === field)?.message

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <AuthForm
        title="Create Account"
        description="Sign up to start using Digital Signature App"
        onSubmit={handleSubmit}
        isLoading={isLoading}
        footerContent={
          <p>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        {errors.find((e) => e.field === 'form') && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.find((e) => e.field === 'form')?.message}
          </div>
        )}
        <Input
          type="text"
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={getFieldError('name')}
          disabled={isLoading}
        />
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
          helperText="Must be at least 8 characters"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={getFieldError('password')}
          disabled={isLoading}
        />
        <Input
          type="password"
          label="Confirm Password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={getFieldError('confirmPassword')}
          disabled={isLoading}
        />
      </AuthForm>
    </div>
  )
}