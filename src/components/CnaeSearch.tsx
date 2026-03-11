import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Cnae } from '../types';
import { Search, PlusCircle, Loader2, Info } from 'lucide-react';
import { applyCnaeMask } from '../utils/masks';

interface Props {
  onAdd: (cnae: Cnae) => void;
}

export default function CnaeSearch({ onAdd }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Cnae[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSearch = async () => {
    if (input.length < 9) return;
    setLoading(true);
    setResults([]);
    setSelectedIdx(null);
    try {
      const q = query(collection(db, "cnaes_v2"), where("cnae_codigo", "==", input));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data() as Cnae);
      setResults(data);
      if (data.length === 0) alert("CNAE não encontrado.");
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar CNAE.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (selectedIdx !== null) {
      onAdd(results[selectedIdx]);
      setInput('');
      setResults([]);
      setSelectedIdx(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
        <Search className="mr-2 text-blue-600 w-5 h-5" />
        1. Consultar CNAE
      </h2>
      
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(applyCnaeMask(e.target.value))}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ex: 9602-5/01"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </div>

      {results.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-sm font-bold text-gray-500 uppercase mb-3">Selecione o Grupo Específico:</p>
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
            {results.map((item, idx) => {
              const gruposBaixoRisco = ["nR1", "nR2", "Ind-1a", "Ind-1b"];
              const ehGrupoElegivel = item.grupo_atividade && gruposBaixoRisco.some(g => item.grupo_atividade.startsWith(g));
              const isBaixoRisco = item.baixo_risco && ehGrupoElegivel;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedIdx === idx
                      ? 'border-blue-600 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center ${
                      selectedIdx === idx ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedIdx === idx && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-bold text-blue-900">{item.grupo_atividade}</span>
                        {isBaixoRisco && (
                          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200">
                            BAIXO RISCO
                          </span>
                        )}
                        {item.mei_status === 'dispensa' && (
                          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200">
                            MEI: DISPENSA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 uppercase mt-1 leading-tight font-semibold">
                        {item.nome_grupo}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {item.descricao}
                      </div>
                      
                      {item.mei_ocupacoes && item.mei_ocupacoes.length > 0 && (
                        <ul className="mt-2 text-[10px] text-gray-500 border-t pt-1 space-y-1">
                          {item.mei_ocupacoes.map((o, i) => (
                            <li key={i}>- {o.nome} {o.obs && <span className="text-red-500 font-bold">({o.obs})</span>}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleAdd}
            disabled={selectedIdx === null}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center"
          >
            <PlusCircle className="mr-2 w-5 h-5" />
            ADICIONAR ESTE CNAE À LISTA
          </button>
        </div>
      )}
    </div>
  );
}
