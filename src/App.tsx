import React, { useState } from 'react';
import { Header } from './components/Header';
import { InterviewCoachView } from './components/InterviewCoach/InterviewCoachView';
import { CareerCoachView } from './components/CareerCoach/CareerCoachView';
import { Sparkles, Shield, Compass, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'career'>('interview');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1 pb-16">
        {activeTab === 'interview' ? <InterviewCoachView /> : <CareerCoachView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Interview & Career Coach AI • Hazırlık & Gelişim Sistemi</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                <span>STAR Metodu & Persona Analizi</span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Müfredat & Boşluk Taraması</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
