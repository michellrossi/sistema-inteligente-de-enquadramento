export interface Cnae {
  cnae_codigo: string;
  grupo_atividade: string;
  nome_grupo?: string;
  descricao: string;
  baixo_risco?: boolean;
  mei_status?: 'dispensa' | 'com_licenca' | 'nao_permitido';
  mei_observacao?: string;
  mei_ocupacoes?: { nome: string; obs?: string }[];
}

export interface ZoningRule {
  SUBCAT_USO: string;
  [zona: string]: string;
}

export interface RoadRule {
  SUBCATEGORIA_DE_USO: string;
  LARGURA_MINIMA_DE_VIA: string;
}

export type ViabilityStatus = 'PERMITIDO_30' | 'PERMITIDO_10' | 'NAO_PERMITIDO_5' | 'CONFORME_90';

export interface ViabilityResult {
  cnae: Cnae;
  status: ViabilityStatus;
  reason: string;
  permitidoZona: boolean;
  permitidoVia: boolean;
}

export interface AnalysisParams {
  zona: string;
  larguraVia: number;
}

export interface FormData {
  demandaProcesso: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  nomeResponsavel: string;
  cpf: string;
  endereco: string;
  complemento: string;
  sql: string;
  descricaoExtra: string;
  edificacao: 'Regular' | 'Irregular';
  areaAtividade: string;
  funcionario: string;
  cargo: string;
  rf: string;
  statusLegal: string;
}
