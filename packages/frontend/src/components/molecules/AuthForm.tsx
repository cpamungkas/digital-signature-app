import { forwardRef } from 'react'
import { Button } from '../atoms/Button'
import { Input } from '../atoms/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../atoms/Card'

export interface AuthFormProps {
  title: string
  description?: string
  onSubmit: (e: React.FormEvent) => void
  children: React.ReactNode
  isLoading?: boolean
  footerContent?: React.ReactNode
}

const AuthForm = forwardRef<HTMLFormElement, AuthFormProps>(
  ({ title, description, onSubmit, children, isLoading, footerContent }, ref) => {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Submit
            </Button>
            {footerContent && <div className="text-center text-sm text-muted-foreground">{footerContent}</div>}
          </CardFooter>
        </form>
      </Card>
    )
  }
)

AuthForm.displayName = 'AuthForm'

export { AuthForm }