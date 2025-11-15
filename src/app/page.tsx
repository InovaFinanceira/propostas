import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center items-center">
          <Image
            src="/logo.png"
            alt="Grupo Inova Financeira Logo"
            width={180}
            height={60}
            priority
          />
          <CardTitle className="text-2xl font-bold tracking-tight pt-4">Acesse sua conta</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para entrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
