import React from 'react';
import { Cnae } from '../types';
import { Trash2, Inbox, List } from 'lucide-react';

interface Props {
  items: Cnae[];
  onRemove: (index: number) => void;
}

export default function CnaeList({ items, onRemove }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
      <h2 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
        <List className="mr-2 text-blue-600 w-5 h-5" />
        CNAEs Adicionados
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
          {items.length}
        </span>
      </h2>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {items.length === 0 ? (
          <div className="mt-10 opacity-50 text-center text-gray-500">
            <Inbox className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Sua lista está vazia.</p>
          </div>
        ) : (
          items.map((item, idx) => {
            const gruposBaixoRisco = ["nR1", "nR2"];
            const isBaixoRisco = item.baixo_risco && gruposBaixoRisco.some(g => item.grupo_atividade.startsWith(g));

            return (
              <div
                key={idx}
                className="bg-blue-50 p-3 rounded border border-blue-100 flex justify-between items-start group animate-in slide-in-from-right-2 duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-sm">CNAE: {item.cnae_codigo}</div>
                  <div className="text-xs text-blue-700 font-bold mt-1 flex items-center gap-1">
                    {item.grupo_atividade}
                    {isBaixoRisco && <span className="text-green-600">✓ Risco</span>}
                    {item.mei_status === 'dispensa' && <span className="text-purple-600">★ MEI(D)</span>}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {item.descricao}
                  </div>
                </div>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-red-400 hover:text-red-600 p-1 transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
