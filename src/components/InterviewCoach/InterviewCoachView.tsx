import React, { useState } from 'react';
import {
  INTERVIEW_PRESETS,
  INTERVIEWER_TITLE_SUGGESTIONS,
  InterviewPreset,
} from '../../data/presets';
import { InterviewGenerationResponse } from '../../types';
import { InterviewerProfileCard } from './InterviewerProfileCard';
import { QuestionCard } from './QuestionCard';
import {
  Sparkles,
  Target,
  Briefcase,
  Layers,
  Building2,
  HelpCircle,
  Copy,
  Check,
  Send,
  MessageSquareQuote,
  Lightbulb,
} from 'lucide-react';

export const InterviewCoachView: React.FC = () => {
  const [interviewerTitle, setInterviewerTitle] = useState('Chief Technology Officer (CTO)');
  const [candidateRole, setCandidateRole] = useState('Senior Fullstack Software Engineer');
  const [seniorityLevel, setSeniorityLevel] = useState('Senior (5+ Yıl)');
  const [companyType, setCompanyType] = useState('B2B SaaS Ölçeklenme Şirketi');
  const [interviewStage, setInterviewStage] = useState('Teknik Mimari & Stratejik Vizyon Mülakatı');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewGenerationResponse | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [copiedReport, setCopiedReport] = useState(false);

  const handleApplyPreset = (preset: InterviewPreset) => {
    setInterviewerTitle(preset.interviewerTitle);
    setCandidateRole(preset.candidateRole);
    setSeniorityLevel(preset.seniorityLevel);
    setCompanyType(preset.companyType);
    setInterviewStage(preset.interviewStage);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!interviewerTitle.trim() || !candidateRole.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerTitle: interviewerTitle.trim(),
          candidateRole: candidateRole.trim(),
          seniorityLevel,
          companyType,
          interviewStage,
          language: 'tr',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Sorular üretilirken bir hata meydana geldi.');
      }

      const data: InterviewGenerationResponse = await res.json();
      setResult(data);
      setSelectedCategory('Tümü');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (!result) return;
    let markdown = `# Mülakat Hazırlık Raporu - Görüşmeci: ${result.interviewerProfile.title}\n\n`;
    markdown += `**Hedef Rol:** ${candidateRole} (${seniorityLevel})\n`;
    markdown += `**Görüşmeci Zihniyeti:** ${result.interviewerProfile.primaryFocus}\n\n`;
    markdown += `## Potansiyel Sorular ve STAR Çözümleri\n\n`;
    result.questions.forEach((q, i) => {
      markdown += `### ${i + 1}. ${q.question} (${q.category} - ${q.difficulty})\n`;
      markdown += `- **Neden Soruluyor:** ${q.whyTheyAsk}\n`;
      markdown += `- **STAR Tavsiyesi:** Durum: ${q.starGuide.situation} | Eylem: ${q.starGuide.action} | Sonuç: ${q.starGuide.result}\n`;
      markdown += `- **Örnek Güçlü Cevap:** ${q.sampleStrongAnswer}\n\n`;
    });
    navigator.clipboard.writeText(markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const categories = result
    ? ['Tümü', ...Array.from(new Set(result.questions.map((q) => q.category)))]
    : [];

  const filteredQuestions = result
    ? selectedCategory === 'Tümü'
      ? result.questions
      : result.questions.filter((q) => q.category === selectedCategory)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Mülakat Psikolojisi & Soru Üretici</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Görüşmecinin Ünvanına Özel Mülakat Simülatörü
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Farklı ünvanlar aynı rol için tamamen farklı sorular sorar! Bir CTO mimari riskleri
            ve teknik borcu sorgularken, bir İK Direktörü liderlik ve kriz yönetimini, bir CPO ise
            kullanıcı metriklerini hedefler. Görüşmecinizin ünvanını girin; zihniyetini, soracağı
            soruları ve onu etkileyecek cevapları keşfedin.
          </p>

          {/* Quick Presets */}
          <div className="mt-5 pt-4 border-t border-indigo-700/50">
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-2">
              Hazır Senaryoları Dene:
            </span>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs bg-indigo-700/40 hover:bg-indigo-600/60 border border-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Target className="w-3 h-3 text-indigo-300" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <form
        onSubmit={handleGenerate}
        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Interviewer Title (KEY INPUT) */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Mülakatı Yapacak Kişinin Ünvanı (Title) *
            </label>
            <input
              type="text"
              value={interviewerTitle}
              onChange={(e) => setInterviewerTitle(e.target.value)}
              placeholder="Örn: Engineering Manager, CTO, Head of Product, HRBP, Lead Data Scientist..."
              required
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
            {/* Quick Title Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Önerilenler:</span>
              {INTERVIEWER_TITLE_SUGGESTIONS.slice(0, 5).map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setInterviewerTitle(title)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Başvurduğun Pozisyon / Rol *
            </label>
            <input
              type="text"
              value={candidateRole}
              onChange={(e) => setCandidateRole(e.target.value)}
              placeholder="Örn: Senior Frontend Developer, Product Manager..."
              required
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          {/* Seniority */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Deneyim Seviyesi
            </label>
            <select
              value={seniorityLevel}
              onChange={(e) => setSeniorityLevel(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="Junior (0-2 Yıl)">Junior (0-2 Yıl)</option>
              <option value="Mid-Level (2-4 Yıl)">Mid-Level (2-4 Yıl)</option>
              <option value="Senior (5+ Yıl)">Senior (5+ Yıl)</option>
              <option value="Lead / Principal (8+ Yıl)">Lead / Principal (8+ Yıl)</option>
              <option value="Yönetici / Executive">Yönetici / Executive</option>
            </select>
          </div>

          {/* Company Type / Sector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Şirket Türü / Sektör
            </label>
            <input
              type="text"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              placeholder="Örn: B2B SaaS, FinTech, Global E-Ticaret, Erken Aşama Startup..."
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            />
          </div>

          {/* Interview Stage */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Mülakatın Aşaması
            </label>
            <select
              value={interviewStage}
              onChange={(e) => setInterviewStage(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-4 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              <option value="Teknik & Mimari Mülakat">Teknik & Mimari Derinlik Mülakatı</option>
              <option value="İlk İK Taraması & Kariyer Geçmişi">İlk İK Taraması & Kariyer Özeti</option>
              <option value="Liderlik, Kültür & Takım Uyumu">Liderlik, Kültür & Takım Uyumu</option>
              <option value="Case Çalışması & Problem Çözme">Case / Vaka Çalışması & Problem Çözme</option>
              <option value="Yönetici / Bar Raiser Son Aşama">Yönetici / Kurucu Son Tur</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            💡 Yapay zeka bu ünvanın karar verme dinamiklerine göre soruları özelleştirecektir.
          </p>
          <button
            type="submit"
            disabled={isLoading || !interviewerTitle.trim() || !candidateRole.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Görüşmeci Zihniyeti Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Soruları ve Koçluk Rehberini Üret</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
      </form>

      {/* Results Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Interviewer Persona Card */}
          <InterviewerProfileCard profile={result.interviewerProfile} />

          {/* Action Bar & Category Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Potansiyel Mülakat Soruları</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {result.questions.length} Soru
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Soruların üzerine tıklayarak STAR cevap taslaklarını inceleyebilir ve yanıtınızı test edebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors shadow-2xs"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Rapor Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tüm Raporu Kopyala (Markdown)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <QuestionCard
                key={q.id || idx}
                question={q}
                index={idx}
                interviewerTitle={result.interviewerProfile.title}
                candidateRole={candidateRole}
              />
            ))}
          </div>

          {/* Candidate Questions to Ask The Interviewer */}
          {result.candidateQuestionsToAsk && result.candidateQuestionsToAsk.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-5">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                  <MessageSquareQuote className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    Etkileyici Bir Kapanış İçin
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    Bu Ünvandaki Görüşmeciye Senin Sorabileceğin Stratejik Sorular
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.candidateQuestionsToAsk.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-white leading-snug">
                        "{item.question}"
                      </p>
                    </div>
                    <div className="pl-7">
                      <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold block mb-0.5">
                        Neden Güçlü Bir İzlenim Bırakır?
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.whyItImpresses}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
