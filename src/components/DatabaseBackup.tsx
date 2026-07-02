import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Download, FileJson, FileSpreadsheet, Loader2, ChevronDown, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DatabaseBackup() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAllData = async () => {
    const collections = ['cnaes_v2', 'regras_zoneamento', 'regras_vias'];
    const data: Record<string, any[]> = {};

    for (const colName of collections) {
      const snapshot = await getDocs(collection(db, colName));
      data[colName] = snapshot.docs.map(doc => doc.data());
    }

    return data;
  };

  const handleDownloadJson = async () => {
    setLoading(true);
    setIsOpen(false);
    try {
      const allData = await fetchAllData();
      const jsonString = JSON.stringify(allData, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_firebase_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar backup JSON:', error);
      alert('Erro ao gerar backup JSON. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (array: any[]) => {
    if (!array || array.length === 0) return '';
    
    // Obter todas as chaves exclusivas de todos os objetos (caso alguns tenham chaves opcionais)
    const keys = Array.from(
      new Set(array.reduce((acc, obj) => [...acc, ...Object.keys(obj)], [] as string[]))
    );

    const csvRows = [];
    
    // Cabeçalho
    csvRows.push(keys.map(key => `"${key.replace(/"/g, '""')}"`).join(','));
    
    // Linhas de dados
    for (const row of array) {
      const values = keys.map(key => {
        const val = row[key];
        if (val === undefined || val === null) return '""';
        const stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const handleDownloadCsv = async () => {
    setLoading(true);
    setIsOpen(false);
    try {
      const allData = await fetchAllData();
      
      // Como o usuário quer em CSV, e temos 3 tabelas diferentes, faremos o download de 3 arquivos CSV
      // ou um zip (mas para evitar instalar zip no browser e manter leve, fazemos downloads sequenciais)
      const collections = Object.keys(allData);
      
      for (const colName of collections) {
        const csvContent = convertToCSV(allData[colName]);
        if (!csvContent) continue;
        
        // Adiciona um BOM para garantir UTF-8 correto no Excel
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${colName}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Pequena pausa para garantir que os downloads múltiplos não sejam bloqueados pelo navegador
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Erro ao gerar backup CSV:', error);
      alert('Erro ao gerar backup CSV. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          onClick={() => !loading && setIsOpen(!isOpen)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4 text-blue-300" />
          )}
          <span>Backup Firebase</span>
          <ChevronDown className="h-4 w-4 text-blue-300" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para fechar o menu ao clicar fora */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden"
            >
              <div className="py-1">
                <button
                  onClick={handleDownloadJson}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <FileJson className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-semibold">Baixar JSON</div>
                    <div className="text-[10px] text-gray-400">Arquivo único completo</div>
                  </div>
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border-t border-gray-100"
                >
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-semibold">Baixar CSV</div>
                    <div className="text-[10px] text-gray-400">Tabelas individuais (3 arquivos)</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
