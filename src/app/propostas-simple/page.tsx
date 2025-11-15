'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { AuthGuard } from '@/components/auth/auth-guard';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, User, Calendar, Car, DollarSign } from 'lucide-react';

export default function SimplePropostasPage() {
  return (
    <AuthGuard>
      <SimplePropostasContent />
    </AuthGuard>
  );
}

function SimplePropostasContent() {
  const { currentUser, isLoading: userLoading } = useCurrentUser();

  // Consulta apenas as propostas (sem filtro de usuários)
  const proposals = useQuery(
    api.proposals.getProposals,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando usuário...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Não autenticado</h1>
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📋 Propostas (Simples)</h1>
              <p className="text-gray-600">Bem-vindo, {currentUser.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {currentUser.role}
              </Badge>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proposals ? proposals.length : '...'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {proposals ? proposals.filter(p => {
                  const date = new Date(p.dateAdded);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length : '...'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {proposals ? proposals.reduce((sum, p) => sum + (p.value || 0), 0).toLocaleString() : '...'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Lista de Propostas</CardTitle>
          </CardHeader>
          <CardContent>
            {!proposals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando propostas...
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma proposta encontrada.</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira proposta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.slice(0, 10).map((proposal) => (
                  <div key={proposal._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">
                          Proposta #{proposal.proposalNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {proposal.vehicleType} - {proposal.proposalType}
                        </p>
                        <p className="text-sm text-gray-500">
                          Criado por: {proposal.createdBy?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {(proposal.value || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(proposal.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {proposals.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      Mostrando 10 de {proposals.length} propostas
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔧 Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Usuário:</strong> {currentUser.name} ({currentUser.email})</p>
              <p><strong>Role:</strong> {currentUser.role}</p>
              <p><strong>ID:</strong> {currentUser._id}</p>
              <p><strong>Propostas carregadas:</strong> {proposals ? 'Sim' : 'Não'}</p>
              <p><strong>Total:</strong> {proposals?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
