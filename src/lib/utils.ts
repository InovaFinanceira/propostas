import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// FIPE API UTILS

export interface Brand {
  nome: string;
  codigo: string;
}

export interface Model {
  nome: string;
  codigo: number;
}

interface ModelResponse {
  modelos: Model[];
}

export interface Year {
  nome: string;
  codigo: string;
}

export interface VehicleDetails {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

// Configuração da API FIPE v2 com suporte a token
const FIPE_API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2';

// Token FIPE carregado do Vercel (opcional)
const FIPE_TOKEN = process.env.NEXT_PUBLIC_FIPE_TOKEN || null;

// Função para adicionar delay entre requisições (evitar erro 429)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para fazer requisições com retry automático e autenticação
const fetchWithRetry = async (url: string, maxRetries: number = 3): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Delay otimizado baseado no token
      let delayTime = 0;
      if (attempt > 1) {
        // Com token: delays menores (200ms, 500ms)
        // Sem token: delays maiores (1s, 2s)
        delayTime = FIPE_TOKEN
          ? Math.pow(2, attempt - 2) * 200  // 200ms, 400ms
          : Math.pow(2, attempt - 1) * 500; // 500ms, 1000ms
        await delay(delayTime);
      }

      // Configurar headers com token se disponível
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      if (FIPE_TOKEN) {
        headers['X-Subscription-Token'] = FIPE_TOKEN;
      }

      const response = await fetch(url, { headers });

      if (response.ok) {
        return response;
      }

      if (response.status === 429) {
        const message = FIPE_TOKEN
          ? `Rate limit atingido mesmo com token na tentativa ${attempt}`
          : `Rate limit (sem token) na tentativa ${attempt}`;

        if (attempt === maxRetries) {
          const errorMsg = FIPE_TOKEN
            ? 'API FIPE: Limite de requisições atingido mesmo com token. Tente novamente em alguns minutos.'
            : 'API FIPE: Limite gratuito atingido. Configure um token para mais requisições ou aguarde.';
          throw new Error(errorMsg);
        }
        continue;
      }

      // Outros erros HTTP
      throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);

    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Nas demais tentativas, apenas repete silenciosamente
    }
  }

  throw new Error('Falha após todas as tentativas');
};


export const fetchBrands = async (vehicleType: 'carros' | 'motos' | 'caminhoes'): Promise<Brand[]> => {
  try {
    // Mapear tipos para API v2
    const typeMap = { 'carros': 'cars', 'motos': 'motorcycles', 'caminhoes': 'trucks' };
    const apiType = typeMap[vehicleType];

    const response = await fetchWithRetry(`${FIPE_API_BASE_URL}/${apiType}/brands`);
    const data = await response.json();

    // Converter formato da API v2 para v1 (compatibilidade)
    return data.map((item: any) => ({
      nome: item.name,
      codigo: item.code
    }));
  } catch (error) {
    throw new Error('Falha ao buscar as marcas. Verifique sua conexão ou tente novamente em alguns minutos.');
  }
};

export const fetchModels = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string
): Promise<Model[]> => {
  try {
    // Mapear tipos para API v2
    const typeMap = { 'carros': 'cars', 'motos': 'motorcycles', 'caminhoes': 'trucks' };
    const apiType = typeMap[vehicleType];

    const response = await fetchWithRetry(
      `${FIPE_API_BASE_URL}/${apiType}/brands/${brandCode}/models`
    );
    const data = await response.json();

    // Converter formato da API v2 para v1 (compatibilidade)
    return data.map((item: any) => ({
      nome: item.name,
      codigo: item.code
    }));
  } catch (error) {
    throw new Error('Falha ao buscar os modelos. Verifique sua conexão ou tente novamente em alguns minutos.');
  }
};

export const fetchYears = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string,
  modelCode: string
): Promise<Year[]> => {
  try {
    // Mapear tipos para API v2
    const typeMap = { 'carros': 'cars', 'motos': 'motorcycles', 'caminhoes': 'trucks' };
    const apiType = typeMap[vehicleType];

    const response = await fetchWithRetry(
      `${FIPE_API_BASE_URL}/${apiType}/brands/${brandCode}/models/${modelCode}/years`
    );
    const data = await response.json();

    // Converter formato da API v2 para v1 (compatibilidade)
    return data.map((item: any) => ({
      nome: item.name,
      codigo: item.code
    }));
  } catch (error) {
    throw new Error('Falha ao buscar os anos. Verifique sua conexão ou tente novamente em alguns minutos.');
  }
};

export const fetchVehicleDetails = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandCode: string,
  modelCode: string,
  yearCode: string
): Promise<VehicleDetails> => {
  try {
    // Mapear tipos para API v2
    const typeMap = { 'carros': 'cars', 'motos': 'motorcycles', 'caminhoes': 'trucks' };
    const apiType = typeMap[vehicleType];

    const response = await fetchWithRetry(
      `${FIPE_API_BASE_URL}/${apiType}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`
    );
    const data = await response.json();

    // Converter formato da API v2 para v1 (compatibilidade)
    return {
      Valor: data.price,
      Marca: data.brand,
      Modelo: data.model,
      AnoModelo: data.modelYear,
      Combustivel: data.fuel,
      CodigoFipe: data.codeFipe,
      MesReferencia: data.referenceMonth,
      TipoVeiculo: data.vehicleType,
      SiglaCombustivel: data.fuelAcronym
    };
  } catch (error) {
    throw new Error('Falha ao buscar os detalhes do veículo. Verifique sua conexão ou tente novamente em alguns minutos.');
  }
};
