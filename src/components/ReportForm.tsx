import React, { useState, useEffect } from 'react';
import { FormData, ViabilityResult, ViabilityStatus } from '../types';
import { FileText, FileDown } from 'lucide-react';
import { applyCnpjMask, applyCpfMask, applySqlMask } from '../utils/masks';
import { generatePdf } from '../utils/pdfGenerator';

interface Props {
  results: ViabilityResult[];
  worstStatus: ViabilityStatus;
}

const STATUS_OPTIONS = [
  {
    id: 'conforme_90',
    title: 'Uso CONFORME (90 dias)',
    text: 'Aquele permitido no local e que atende também a todos os parâmetros de incomodidade e condições de instalação dos usos constantes dos Quadros 4A e 4B da lei nº 16.402/16. (art. 131, §3º)',
    value: 'Uso CONFORME (ou tolerado - art. 135) (regularizar ou encerrar em 90 dias úteis - art. 141, inciso I) - aquele permitido no local e que atende também a todos os parâmetros de incomodidade e condições de instalação dos usos constantes dos Quadros 4A e 4B da lei nº 16.402/16. (art. 131, §3º)',
    status: 'PERMITIDO_30'
  },
  {
    id: 'permitido_30',
    title: 'Uso PERMITIDO (30 dias)',
    text: 'É aquele passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, §1º)',
    value: 'Uso PERMITIDO (ou tolerado - art. 135) (regularizar ou encerrar em 30 dias úteis - art. 141, inciso II) - é aquele passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, §1º)',
    status: 'PERMITIDO_30'
  },
  {
    id: 'permitido_10',
    title: 'Uso PERMITIDO (10 dias)',
    text: 'É aquele passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, §1º) / mas não atenda as condições de instalação ou as normas de segurança, de habitabilidade ou de higiene.',
    value: 'Uso PERMITIDO (ou tolerado - art. 135) (regularizar ou encerrar em 10 dias úteis - art. 141, § 1º) - é aquele passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, §1º) / mas não atenda as condições de instalação ou as normas de segurança, de habitabilidade ou de higiene (art. 141, §1º)',
    status: 'PERMITIDO_10'
  },
  {
    id: 'nao_permitido_5',
    title: 'Uso NÃO PERMITIDO (5 dias)',
    text: 'É aquele não passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, § 2º)',
    value: 'Uso NÃO PERMITIDO (encerrar em 5 dias úteis - art. 141 - inciso III) - é aquele não passível de ser implantado ou instalado no imóvel em função da zona e da largura da via. (art. 131, § 2º)',
    status: 'NAO_PERMITIDO_5'
  }
];

export default function ReportForm({ results, worstStatus }: Props) {
  const [form, setForm] = useState<FormData>({
    demandaProcesso: '',
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    nomeResponsavel: '',
    cpf: '',
    endereco: '',
    complemento: '',
    sql: '',
    descricaoExtra: '',
    edificacao: 'Regular',
    areaAtividade: '',
    funcionario: '',
    cargo: '',
    rf: '',
    statusLegal: ''
  });

  useEffect(() => {
    // Auto-select status based on worst case
    let autoValue = '';
    if (worstStatus === 'NAO_PERMITIDO_5') {
      autoValue = STATUS_OPTIONS.find(o => o.id === 'nao_permitido_5')?.value || '';
    } else if (worstStatus === 'PERMITIDO_10') {
      autoValue = STATUS_OPTIONS.find(o => o.id === 'permitido_10')?.value || '';
    } else {
      autoValue = STATUS_OPTIONS.find(o => o.id === 'permitido_30')?.value || '';
    }
    setForm(prev => ({ ...prev, statusLegal: autoValue }));
  }, [worstStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;
    if (name === 'cnpj') maskedValue = applyCnpjMask(value);
    if (name === 'cpf') maskedValue = applyCpfMask(value);
    if (name === 'sql') maskedValue = applySqlMask(value);
    setForm(prev => ({ ...prev, [name]: maskedValue }));
  };

  const handlePdf = () => {
    generatePdf(form, results);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6 flex items-center">
        <FileText className="mr-2 text-red-600 w-5 h-5" />
        3. Emissão de Documento
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
        <div className="space-y-1">
          <label className="font-bold text-gray-600">Nº Demanda/Processo</label>
          <input name="demandaProcesso" value={form.demandaProcesso} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-gray-600">CNPJ</label>
          <input name="cnpj" value={form.cnpj} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-600">Razão Social</label>
          <input name="razaoSocial" value={form.razaoSocial} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-600">Nome Fantasia</label>
          <input name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-gray-600">Nome Responsável</label>
          <input name="nomeResponsavel" value={form.nomeResponsavel} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-gray-600">CPF</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-600">Endereço Completo</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-gray-600">Complemento</label>
          <input name="complemento" value={form.complemento} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="space-y-1">
          <label className="font-bold text-gray-600">SQL (IPTU)</label>
          <input name="sql" value={form.sql} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-600">Descrição das atividades (Manual)</label>
          <input name="descricaoExtra" value={form.descricaoExtra} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Descreva as atividades..." />
        </div>

        <div className="md:col-span-2 border-t pt-4 mt-2">
          <label className="font-bold text-blue-800 block mb-2">Dados para Enquadramento (Item 2)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <label className="font-bold text-gray-600 block mb-2 text-xs uppercase">Edificação</label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="edificacao"
                    value="Regular"
                    checked={form.edificacao === 'Regular'}
                    onChange={() => setForm(prev => ({ ...prev, edificacao: 'Regular' }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Regular</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="edificacao"
                    value="Irregular"
                    checked={form.edificacao === 'Irregular'}
                    onChange={() => setForm(prev => ({ ...prev, edificacao: 'Irregular' }))}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Irregular</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-600 text-xs uppercase">Área da Atividade (m²)</label>
              <input
                type="number"
                name="areaAtividade"
                value={form.areaAtividade}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-200">
        <label className="block text-sm font-bold text-blue-900 mb-3 uppercase">Responsável pela Análise (Assinatura):</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <label className="font-bold text-gray-600">Nome do Funcionário</label>
            <input name="funcionario" value={form.funcionario} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: João Silva" />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-600">Cargo/Função</label>
            <input name="cargo" value={form.cargo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Agente Vistor" />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-gray-600">R.F. (Registro Funcional)</label>
            <input name="rf" value={form.rf} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 854.123-1" />
          </div>
        </div>
      </div>

      <div className="mb-8 bg-gray-50 p-4 rounded border border-gray-200">
        <label className="block text-sm font-bold text-blue-900 mb-3 uppercase">Conclusão Legal Final:</label>
        <div className="space-y-3">
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                form.statusLegal === opt.value
                  ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="statusLegal"
                value={opt.value}
                checked={form.statusLegal === opt.value}
                onChange={handleChange}
                className="mt-1 mr-3 w-4 h-4 text-blue-600"
              />
              <div className="text-xs text-justify">
                <strong className={`block mb-1 ${opt.id === 'nao_permitido_5' ? 'text-red-700' : 'text-gray-900'}`}>
                  {opt.title}
                </strong>
                <span className="text-gray-600 leading-relaxed">{opt.text}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handlePdf}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center text-lg transition-transform active:scale-[0.98]"
      >
        <FileDown className="mr-2 w-6 h-6" />
        GERAR RELATÓRIO COMPLETO
      </button>
    </div>
  );
}
