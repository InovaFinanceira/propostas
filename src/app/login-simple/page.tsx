'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAction } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha não pode estar em branco.' }),
});

export default function SimpleLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAction(api.userActions.login);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Tentando login com:', values.email);
      const result = await login(values);
      console.log('✅ Login resultado:', result);
      
      if (result.userId) {
        // Salva no localStorage
        window.localStorage.setItem('userId', result.userId);
        
        // Salva no cookie
        const cookieValue = `userId=${result.userId}; path=/; max-age=86400; secure=${window.location.protocol === 'https:'}; samesite=strict`;
        document.cookie = cookieValue;
        
        console.log('🚀 Redirecionando para /propostas-simple');
        router.push('/propostas-simple');
      } else {
        setError('ID de usuário não retornado.');
      }
    } catch (error: any) {
      console.error('❌ Erro de login:', error);
      setError(error.message || 'Ocorreu um erro no login.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🔐 Login Simples</h1>
          <p className="text-gray-600 mt-2">Sistema de Propostas</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="seuemail@exemplo.com" 
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="********" 
                      autoComplete="current-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Credenciais de teste:
          </p>
          <p className="text-xs text-gray-400 mt-1">
            contato@grupoinovafinanceira.com
          </p>
        </div>
      </div>
    </div>
  );
}
