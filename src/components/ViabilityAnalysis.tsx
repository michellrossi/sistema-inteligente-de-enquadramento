import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Cnae, ZoningRule, RoadRule, ViabilityResult, ViabilityStatus } from '../types';
import { calculateViability, getWorstCaseStatus } from '../logic/viability';
import { Calculator, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface Props {
  cnaes: Cnae[];
  onAnalysisComplete: (results: ViabilityResult[], worstStatus: ViabilityStatus) => void;
}

const ZONES = [
  "AC-1", "AC-2", "AI", "AIa", "AMISa", "AVP-1", "AVP-2", "ZC", "ZC-ZEIS", "ZCa",
  "ZCOR-1", "ZCOR-2", "ZCOR-3", "ZCORa", "ZDE-1", "ZDE-2", "ZEIS-1", "ZEIS-2",
  "ZEIS-3", "ZEIS-4", "ZEIS-5", "ZEM", "ZEMP", "ZEPAM", "ZER-1", "ZER-2", "ZEU",
  "ZEUa", "ZEUP", "ZEUPa", "ZM", "ZMa", "ZMIS", "ZPDS", "ZPDSn", "ZPI-1", "ZPI-2",
  "ZPR", "ZPR-3"
];

export default function ViabilityAnalysis({ cnaes, onAnalysisComplete }: Props) {
  const [zona, setZona] = useState('');
  const [largura, setLargura] = useState('');
  const [regrasZonas, setRegrasZonas] = useState<ZoningRule[]>([]);
  const [regrasVias, setRegrasVias] = useState<RoadRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ViabilityResult[]>([]);

  useEffect(() => {
    async function loadRules() {
      try {
        const [zSnapshot, vSnapshot] = await Promise.all([
          getDocs(collection(db, "regras_zoneamento")),
          getDocs(collection(db, "regras_vias"))
        ]);
        setRegrasZonas(zSnapshot.docs.map(d => d.data() as ZoningRule));
        setRegrasVias(vSnapshot.docs.map(d => d.data() as RoadRule));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRules();
  }, []);

  const handleCalculate = () => {
    if (!zona || !largura) {
      alert("Preencha Zoneamento e Largura.");
      return;
    }
    const lValue = parseFloat(largura);
    const newResults = cnaes.map(cnae => 
      calculateViability(cnae, zona, lValue, regrasZonas, regrasVias)
    );
    setResults(newResults);
    onAnalysisComplete(newResults, getWorstCaseStatus(newResults));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-gray-600 font-medium">Carregando regras da legislação...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
      <h2 className="text-lg font-bold text-blue-900 border-b pb-2 mb-6 flex items-center">
        <Calculator className="mr-2 w-5 h-5" />
        2. Análise de Viabilidade
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Zona de Uso do Imóvel</label>
          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Largura da Via (metros)</label>
          <input
            type="number"
            step="0.1"
            value={largura}
            onChange={(e) => setLargura(e.target.value)}
            placeholder="Ex: 12.00"
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg shadow-lg transition text-lg mb-8 flex items-center justify-center"
      >
        <CheckCircle2 className="mr-2 w-6 h-6" />
        VERIFICAR VIABILIDADE
      </button>

      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 animate-in fade-in duration-500">
          {results.map((res, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-l-8 shadow-sm ${
                res.status === 'NAO_PERMITIDO_5'
                  ? 'border-red-600 bg-red-50 text-red-900'
                  : res.status === 'PERMITIDO_10'
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-green-600 bg-green-50 text-green-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sm">CNAE: {res.cnae.cnae_codigo}</div>
                  <div className="text-xs opacity-75 font-semibold">{res.cnae.grupo_atividade}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {res.status === 'NAO_PERMITIDO_5' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {res.status === 'NAO_PERMITIDO_5' ? 'NÃO PERMITIDO (5 DIAS)' : res.status === 'PERMITIDO_10' ? 'PERMITIDO (10 DIAS)' : 'PERMITIDO (30 DIAS)'}
                    </span>
                  </div>
                  <div className="text-xs mt-1 italic">{res.reason}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
