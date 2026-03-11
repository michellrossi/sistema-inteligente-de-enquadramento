import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from './firebase';
import { Cnae, ViabilityResult, ViabilityStatus } from './types';
import CnaeSearch from './components/CnaeSearch';
import CnaeList from './components/CnaeList';
import ViabilityAnalysis from './components/ViabilityAnalysis';
import ReportForm from './components/ReportForm';
import { LogOut, ShieldCheck, Building2, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cnaes, setCnaes] = useState<Cnae[]>([]);
  const [analysisResults, setAnalysisResults] = useState<ViabilityResult[]>([]);
  const [worstStatus, setWorstStatus] = useState<ViabilityStatus>('PERMITIDO_30');

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  const handleAddCnae = (cnae: Cnae) => {
    if (cnaes.some(c => c.cnae_codigo === cnae.cnae_codigo && c.grupo_atividade === cnae.grupo_atividade)) {
      alert("Este CNAE já foi adicionado.");
      return;
    }
    setCnaes(prev => [...prev, cnae]);
    // Reset analysis when list changes
    setAnalysisResults([]);
  };

  const handleRemoveCnae = (index: number) => {
    setCnaes(prev => prev.filter((_, i) => i !== index));
    setAnalysisResults([]);
  };

  const handleAnalysisComplete = (results: ViabilityResult[], status: ViabilityStatus) => {
    setAnalysisResults(results);
    setWorstStatus(status);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-blue-50 rounded-full">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
            Sistema Inteligente de Enquadramento
          </h1>
          <p className="text-slate-600 mb-8">
            Acesse com sua conta Google para iniciar a análise de viabilidade urbana.
          </p>
          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            ENTRAR COM GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white py-6 shadow-md mb-8 border-b-4 border-blue-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://iili.io/fSppoxe.png" 
              alt="Logo SP" 
              className="h-12 md:h-16 object-contain" 
            />
            <div className="text-left">
              <h1 className="text-xl md:text-2xl font-extrabold uppercase text-blue-900 tracking-tight leading-none">
                Sistema Inteligente de Enquadramento
              </h1>
              <p className="text-slate-500 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest">
                Análise de Viabilidade Multi-CNAE • Lei 16.402/16
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-6xl">
        {/* Step 1: CNAE Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CnaeSearch onAdd={handleAddCnae} />
          </div>
          <div className="lg:col-span-1">
            <CnaeList items={cnaes} onRemove={handleRemoveCnae} />
          </div>
        </div>

        {/* Step 2: Viability Analysis */}
        <AnimatePresence>
          {cnaes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ViabilityAnalysis 
                cnaes={cnaes} 
                onAnalysisComplete={handleAnalysisComplete} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Report Form */}
        <AnimatePresence>
          {analysisResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ReportForm 
                results={analysisResults} 
                worstStatus={worstStatus} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 shadow-lg z-40">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${cnaes.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-bold uppercase text-slate-500">CNAEs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${analysisResults.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
              <span className="text-[10px] font-bold uppercase text-slate-500">Análise</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Desenvolvido para Gestão Urbana • SP
          </div>
        </div>
      </footer>
    </div>
  );
}
