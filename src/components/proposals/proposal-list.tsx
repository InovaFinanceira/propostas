'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProposalForm, ProposalFormData } from './proposal-form';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Id } from '../../../convex/_generated/dataModel';

type Proposal = Omit<ProposalFormData, 'vehicleCondition' | 'status'> & {
  _id: Id<"proposals">;
  _creationTime: number;
  proposalNumber: string;
  dateAdded: string;
  vehicleCondition: string;
  status: string;
  salespersonId: Id<"users">;
  createdBy?: { _id: Id<"users">; name: string; email: string } | null;
};

// Mapeamento de status para variantes de badge
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Em Análise": "secondary",
  "Aprovada": "default",
  "Recusada": "destructive"
};

export function ProposalList() {
    const { toast } = useToast();
    const { currentUser } = useCurrentUser();
    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
    const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

    const [refreshKey, setRefreshKey] = useState(0);

    // Consulta as propostas do backend (só quando autenticado)
    const proposals = useQuery(
      api.proposals.getProposals,
      currentUser?._id ? { userId: currentUser._id } : "skip"
    );

    // Função para forçar atualização
    const forceRefresh = () => {
      setRefreshKey(prev => prev + 1);
    };

    // Log simples para monitoramento (opcional)
    React.useEffect(() => {
      if (proposals) {
        console.log(`📊 Propostas carregadas: ${proposals.length}`);
      }
    }, [proposals]);

    // Sistema funcionando - fallback não é mais necessário

    // QUERY REABILITADA - BASE PROD FUNCIONANDO
    const usersQuery = useQuery(
      api.users.getAllUsers,
      currentUser?._id ? { requesterId: currentUser._id } : "skip"
    );

    // Fallback para garantir que sempre temos pelo menos o usuário atual
    const users = usersQuery || (currentUser ? [
      { _id: currentUser._id, name: currentUser.name, email: currentUser.email, role: currentUser.role }
    ] : []);

    // Mutations para criar, atualizar e excluir propostas
    const createProposalMutation = useMutation(api.proposals.createProposal);
    const updateProposalMutation = useMutation(api.proposals.updateProposal);
    const updateBankAnalysisMutation = useMutation(api.proposals.updateBankAnalysis);
    const deleteProposalMutation = useMutation(api.proposals.deleteProposal);

    const handleFormSubmit = async (data: ProposalFormData) => {
        try {
            // Validação do usuário atual
            if (!currentUser?._id) {
                toast({
                    title: "Erro de Autenticação",
                    description: "Usuário não encontrado. Faça login novamente.",
                    variant: "destructive"
                });
                return;
            }

            console.log("🔍 Criando proposta com userId:", currentUser._id);

            if (editingProposal) {
                // Atualiza proposta existente
                console.log("🔍 Editando proposta com dados:", {
                    proposalId: editingProposal._id,
                    empresa: data.empresa,
                    cargo: data.cargo,
                    naturezaOcupacao: data.naturezaOcupacao,
                    allData: data
                });

                console.log("📤 Dados completos sendo enviados para updateProposal:", {
                    proposalId: editingProposal._id,
                    userId: currentUser._id,
                    ...data
                });

                // Extrair campos de análise bancária e campos que não devem ser enviados
                const {
                  bancoBv,
                  bancoSantander,
                  bancoPan,
                  bancoBradesco,
                  bancoC6,
                  bancoItau,
                  bancoCash,
                  bancoKunna,
                  bancoViaCerta,
                  bancoOmni,
                  bancoDaycoval,
                  bancoSim,
                  bancoCreditas,
                  _creationTime,
                  _id,
                  proposalNumber,
                  dateAdded,
                  salespersonId,
                  createdBy,
                  proposalId,
                  cpfCnpj,
                  email,
                  state,
                  telefonePessoal,
                  telefoneReferencia,
                  endereco,
                  ...restData
                } = data as any;

                console.log("📤 Dados filtrados para updateProposal:", restData);

                // Atualizar dados gerais
                await updateProposalMutation({
                    proposalId: editingProposal._id,
                    userId: currentUser._id as Id<"users">,
                    ...restData
                });

                // Se houver dados bancários, atualize-os separadamente
                const bankData = {
                  bancoBv,
                  bancoSantander,
                  bancoPan,
                  bancoBradesco,
                  bancoC6,
                  bancoItau,
                  bancoCash,
                  bancoKunna,
                  bancoViaCerta,
                  bancoOmni,
                  bancoDaycoval,
                  bancoSim,
                  bancoCreditas,
                };

                // Verificar se tem algum campo de banco definido
                const hasBankData = Object.values(bankData).some(value => value !== undefined);
                
                if (hasBankData) {
                  await updateBankAnalysisMutation({
                    proposalId: editingProposal._id,
                    userId: currentUser._id as Id<"users">,
                    ...bankData
                  });
                }

                toast({
                    title: "Proposta Atualizada",
                    description: "A proposta foi atualizada com sucesso."
                });

                // Fechar diálogo e limpar estado
                setIsDialogOpen(false);
                setEditingProposal(null);

                // Forçar atualização da lista
                console.log("🔄 Forçando atualização da lista...");
                forceRefresh();

                // Aguardar um pouco e forçar reload da página para garantir atualização
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                // Extrair campos de análise bancária para novas propostas
                const {
                  bancoBv,
                  bancoSantander,
                  bancoPan,
                  bancoBradesco,
                  bancoC6,
                  bancoItau,
                  bancoCash,
                  bancoKunna,
                  bancoViaCerta,
                  bancoOmni,
                  bancoDaycoval,
                  bancoSim,
                  bancoCreditas,
                  bancoCrefaz,
                  bancoSimpala,
                  ...restData
                } = data;

                // Cria nova proposta
                const result = await createProposalMutation({
                    ...restData,
                    isFinanced: restData.isFinanced ?? false,
                    brandName: restData.brandName || '',
                    modelName: restData.modelName || '',
                    userId: currentUser._id as Id<"users">
                });

                // Se houver dados bancários, atualize-os separadamente
                const bankData = {
                  bancoBv,
                  bancoSantander,
                  bancoPan,
                  bancoBradesco,
                  bancoC6,
                  bancoItau,
                  bancoCash,
                  bancoKunna,
                  bancoViaCerta,
                  bancoOmni,
                  bancoDaycoval,
                  bancoSim,
                  bancoCreditas,
                  bancoCrefaz,
                  bancoSimpala,
                };

                // Verificar se tem algum campo de banco definido
                const hasBankData = Object.values(bankData).some(value => value !== undefined);
                
                if (hasBankData && result?.proposalId) {
                  await updateBankAnalysisMutation({
                    proposalId: result.proposalId,
                    userId: currentUser._id as Id<"users">,
                    ...bankData
                  });
                }

                toast({
                    title: "Proposta Criada",
                    description: "A proposta foi criada com sucesso."
                });

                // Fechar diálogo e limpar estado
                setIsDialogOpen(false);
                setEditingProposal(null);

                console.log("✅ Dialog fechado, proposta criada com sucesso");
            }
        } catch (error: any) {
            console.error('❌ Erro ao salvar proposta:', error);

            // Tratamento específico de erros
            let errorMessage = "Ocorreu um erro ao processar a proposta.";

            if (error.message?.includes("Server Error")) {
                errorMessage = "Erro no servidor. Verifique se todos os campos estão preenchidos corretamente.";
                console.log("🔍 Possível causa: userId inválido ou campos obrigatórios faltando");
            } else if (error.message?.includes("validation")) {
                errorMessage = "Dados inválidos. Verifique os campos obrigatórios.";
            } else if (error.message?.includes("user")) {
                errorMessage = "Erro de usuário. Faça login novamente.";
            }

            toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    const handleEditClick = (proposal: Proposal) => {
        setEditingProposal(proposal);
        setIsDialogOpen(true);
    }

    // Função para converter Proposal para ProposalFormData
    const convertProposalToFormData = (proposal: Proposal): ProposalFormData => {
        const { _id, proposalNumber, dateAdded, salespersonId, ...formData } = proposal as any;

        console.log("🔍 Convertendo proposta para edição:", {
            empresa: formData.empresa,
            cargo: formData.cargo,
            naturezaOcupacao: formData.naturezaOcupacao,
            proposalId: _id
        });
        return {
            ...formData,
            // Garantir que campos opcionais tenham valores padrão adequados
            plate: formData.plate || '',
            bodywork: formData.bodywork || '',
            version: formData.version || '',
            state: formData.state || '',
            valorFinanciar: formData.valorFinanciar || '',

            // Dados pessoais - garantir valores padrão
            cpfCnpj: formData.cpfCnpj || '',
            email: formData.email || '',
            telefonePessoal: formData.telefonePessoal || '',
            telefoneReferencia: formData.telefoneReferencia || '',
            endereco: formData.endereco || '',

            // Pessoa física
            nome: formData.nome || '',
            dataNascimento: formData.dataNascimento || '',
            sexo: formData.sexo || '',
            nomeMae: formData.nomeMae || '',
            nomePai: formData.nomePai || '',
            rg: formData.rg || '',
            dataEmissaoRg: formData.dataEmissaoRg || '',
            orgaoExpedidor: formData.orgaoExpedidor || '',
            naturalidade: formData.naturalidade || '',
            estadoCivil: formData.estadoCivil || '',
            possuiCnh: formData.possuiCnh || false,

            // Dados profissionais - Pessoa Física
            empresa: formData.empresa || '',
            cargo: formData.cargo || '',
            naturezaOcupacao: formData.naturezaOcupacao || '',

            // Pessoa jurídica
            razaoSocial: formData.razaoSocial || '',
            nomeFantasia: formData.nomeFantasia || '',

            // Tipo de pessoa
            tipoPessoa: formData.tipoPessoa || 'fisica',
        } as ProposalFormData;
    }
    
    const handleNewClick = () => {
        setEditingProposal(null);
        setIsDialogOpen(true);
    }
    
    const handleDeleteClick = (proposal: Proposal) => {
        setProposalToDelete(proposal);
    };

    const handleDeleteConfirm = async () => {
        if (proposalToDelete && currentUser) {
            try {
                await deleteProposalMutation({
                    proposalId: proposalToDelete._id,
                    userId: currentUser._id
                });
                
                toast({
                    title: "Proposta Excluída",
                    description: `A proposta ${proposalToDelete.proposalNumber} foi removida com sucesso.`,
                    variant: 'destructive'
                });
                
                setProposalToDelete(null);
            } catch (error) {
                toast({
                    title: "Erro",
                    description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a proposta.",
                    variant: "destructive"
                });
            }
        }
    };

    // Gera lista de meses para o seletor
    const getMonthOptions = () => {
        const months = [
            { value: 'all', label: 'Todos os meses' },
            { value: '01', label: 'Janeiro' },
            { value: '02', label: 'Fevereiro' },
            { value: '03', label: 'Março' },
            { value: '04', label: 'Abril' },
            { value: '05', label: 'Maio' },
            { value: '06', label: 'Junho' },
            { value: '07', label: 'Julho' },
            { value: '08', label: 'Agosto' },
            { value: '09', label: 'Setembro' },
            { value: '10', label: 'Outubro' },
            { value: '11', label: 'Novembro' },
            { value: '12', label: 'Dezembro' }
        ];
        return months;
    };

    // Filtra as propostas com base na pesquisa, mês e usuário selecionados
    const filteredProposals = proposals?.filter(p => {
        const searchTerm = search.toLowerCase();
        const brandMatch = (p.brandName && p.brandName.toLowerCase().includes(searchTerm)) ||
                         (p.brand && p.brand.toLowerCase().includes(searchTerm));
        const modelMatch = (p.modelName && p.modelName.toLowerCase().includes(searchTerm)) ||
                         (p.model && p.model.toLowerCase().includes(searchTerm));
        const proposalNumberMatch = p.proposalNumber.toLowerCase().includes(searchTerm);

        const searchMatch = brandMatch || modelMatch || proposalNumberMatch;

        // Filtro por mês
        let monthMatch = true;
        if (selectedMonth !== 'all') {
            const proposalDate = new Date(p.dateAdded);
            const proposalMonth = format(proposalDate, 'MM');
            monthMatch = proposalMonth === selectedMonth;
        }

        // Filtro por usuário
        let userMatch = true;
        if (selectedUser !== 'all') {
            userMatch = p.createdBy?._id === selectedUser;
        }

        return searchMatch && monthMatch && userMatch;
    }) || [];

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setIsDialogOpen(isOpen); if (!isOpen) setEditingProposal(null); }}>
        <AlertDialog open={!!proposalToDelete} onOpenChange={(isOpen) => !isOpen && setProposalToDelete(null)}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="mb-1">Propostas</CardTitle>
                        <CardDescription>
                          Gerencie suas propostas de financiamento e refinanciamento.
                        </CardDescription>
                    </div>
                    <Button onClick={handleNewClick}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Nova Proposta
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <Input
                        placeholder="Buscar por marca, modelo ou nº da proposta..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-[300px]"
                      />
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Selecionar mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {getMonthOptions().map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedUser} onValueChange={setSelectedUser}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Todos os usuários" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os usuários</SelectItem>
                          {users && users.filter(u => u !== null).map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {user.name?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <div className="rounded-md border w-full overflow-x-auto md:overflow-x-visible">
                  <Table className="w-full">
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[50px] font-semibold py-3 px-2 text-center text-xs">Nº</TableHead>
                        <TableHead className="w-[55px] font-semibold py-3 px-2 text-center text-xs">Data</TableHead>
                        <TableHead className="w-[100px] hidden xl:table-cell font-semibold py-3 px-2 text-center text-xs">Criado por</TableHead>
                        <TableHead className="w-[65px] font-semibold py-3 px-2 text-center text-xs">Tipo</TableHead>
                        <TableHead className="flex-1 min-w-[120px] font-semibold py-3 px-2 text-center text-xs">Nome</TableHead>
                        <TableHead className="flex-1 min-w-[130px] font-semibold py-3 px-2 text-center text-xs">Marca/Modelo</TableHead>
                        <TableHead className="w-[45px] hidden lg:table-cell font-semibold py-3 px-2 text-center text-xs">Ano</TableHead>
                        <TableHead className="w-[75px] hidden lg:table-cell font-semibold py-3 px-2 text-center text-xs">Valor</TableHead>
                        <TableHead className="w-[65px] font-semibold py-3 px-2 text-center text-xs">Status</TableHead>
                        <TableHead className="w-[45px] py-3 px-2 text-center"><span className="sr-only">Ações</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProposals.length > 0 ? (
                            filteredProposals.map((proposal) => (
                                <TableRow key={proposal._id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium text-xs py-2 px-2 text-center">
                                        {proposal.proposalNumber.replace('PROP-', '')}
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-2 text-center">{format(new Date(proposal.dateAdded), 'dd/MM')}</TableCell>
                                    <TableCell className="hidden xl:table-cell py-2 px-2">
                                        <div className="flex items-center gap-1">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-medium text-primary">
                                                    {proposal.createdBy?.name ? proposal.createdBy.name.charAt(0).toUpperCase() : '?'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-medium truncate">
                                                    {proposal.createdBy?.name || 'Não encontrado'}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {proposal.createdBy?.email || ''}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs py-2 px-2 text-center">
                                        <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                            {proposal.proposalType === 'financing' ? 'Financ.' : 'Refinanc.'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-2 px-2 text-center">
                                        <div className="font-medium text-xs truncate">
                                            {proposal.tipoPessoa === 'fisica'
                                                ? (proposal.nome || 'Não informado')
                                                : (proposal.razaoSocial || 'Não informado')
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 px-2 text-center">
                                        <div className="space-y-0.5">
                                            <div className="font-medium text-xs truncate">{proposal.brandName || proposal.brand}</div>
                                            <div className="text-xs text-muted-foreground truncate">{proposal.modelName || proposal.model}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs py-2 px-2 text-center">
                                        {typeof proposal.modelYear === 'string' && proposal.modelYear.includes('-') ? proposal.modelYear.split('-')[0] : proposal.modelYear}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-xs py-2 px-2 font-medium text-center">
                                        <div className="truncate">
                                            {proposal.valorFinanciar || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 px-2 text-center">
                                        <div className="truncate">
                                            <Badge variant={statusVariant[proposal.status] || 'outline'} className="text-xs">
                                                {proposal.status}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-2 px-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditClick(proposal as any)}>Editar</DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                                                        onSelect={(e) => e.preventDefault()}
                                                        onClick={() => handleDeleteClick(proposal as any)}
                                                    >
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    Nenhuma proposta encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a proposta
                    <span className="font-bold"> {proposalToDelete?.proposalNumber}</span>.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProposal ? 'Editar Proposta' : 'Nova Proposta'}</DialogTitle>
                <DialogDescription>{editingProposal ? 'Atualize os dados da proposta abaixo.' : 'Preencha os campos abaixo para criar uma nova proposta.'}</DialogDescription>
            </DialogHeader>
            <ProposalForm
                onSubmit={handleFormSubmit}
                initialData={editingProposal ? convertProposalToFormData(editingProposal) : undefined}
            />
        </DialogContent>
      </Dialog>
    </>
  );
}
