import React, { useState } from 'react';
import { TrainingItem, CareerAnalysisResponse } from '../../types';
import { CAREER_PRESETS, CareerPreset } from '../../data/presets';
import { TrainingCardItem } from './TrainingCardItem';
import {
  GraduationCap,
  Sparkles,
  Plus,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Code,
  Calendar,
  Copy,
  Check,
  Target,
  FileText,
  Briefcase,
} from 'lucide-react';

export const CareerCoachView: React.FC = () => {
  // Presets default
  const defaultPreset = CAREER_PRESETS[0];

  const [currentRole, setCurrentRole] = useState(defaultPreset.currentRole);
  const [targetRole, setTargetRole] = useState(defaultPreset.targetRole);
  const [industryOrDomain, setIndustryOrDomain] = useState(defaultPreset.industryOrDomain);
  const [hoursPerWeek, setHoursPerWeek] = useState(defaultPreset.hoursPerWeek);
  const [trainings, setTrainings] = useState<TrainingItem[]>(defaultPreset.trainings);

  // New Training modal/inline form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newSkills, setNewSkills] = useState('');

  // AI Analysis state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerAnalysisResponse | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleApplyPreset = (preset: CareerPreset) => {
    setCurrentRole(preset.currentRole);
    setTargetRole(preset.targetRole);
    setIndustryOrDomain(preset.industryOrDomain);
    setHoursPerWeek(preset.hoursPerWeek);
    setTrainings(preset.trainings);
    setResult(null);
  };

  const handleAddTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TrainingItem = {
      id: `tr-${Date.now()}`,
      title: newTitle.trim(),
      provider: newProvider.trim() || 'Online Platform',
      contentSummary: newContent.trim() || 'İçerik belirtilmedi.',
      durationOrYear: newDuration.trim(),
      skillsLearned: newSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setTrainings([...trainings, newItem]);
    setNewTitle('');
    setNewProvider('');
    setNewContent('');
    setNewDuration('');
    setNewSkills('');
    setShowAddForm(false);
  };

  const handleUpdateTraining = (updated: TrainingItem) => {
    setTrainings(trainings.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings(trainings.filter((t) => t.id !== id));
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (trainings.length === 0) {
      setError('Lütfen analiz için en az bir tamamlanan eğitim/kurs ekleyin.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/career/analyze-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainings,
          currentRole,
          targetRole,
          industryOrDomain,
          learningPreferences: {
            hoursPerWeek,
          },
          language: 'tr',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Eğitim analizi yapılırken bir hata oluştu.');
      }

      const data: CareerAnalysisResponse = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analiz sırasında bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    let md = `# Kariyer Gelişim & Eğitim Yol Haritası Raporu\n\n`;
    md += `**Mevcut Durum:** ${currentRole}\n`;
    md += `**Hedef:** ${targetRole}\n\n`;
    md += `## Yönetici Özeti\n${result.executiveSummary}\n\n`;
    md += `## Seviye Analizi\n${result.currentLevelAssessment}\n\n`;
    md += `## Bir Sonraki Adım İçin Önerilen Eğitimler\n\n`;
    result.nextTrainingRecommendations.forEach((rec, idx) => {
      md += `### ${idx + 1}. ${rec.title} (${rec.priority})\n`;
      md += `- **Neden Alınmalı:** ${rec.whyThisNext}\n`;
      md += `- **Önerilen Müfredat:**\n`;
      rec.targetCurriculumModules.forEach((m) => {
        md += `  * ${m}\n`;
      });
      md += `- **Önerilen Platformlar:** ${rec.suggestedPlatformsOrCertifications.join(', ')}\n\n`;
    });
    md += `## Pekiştirici Portfolyo Projesi: ${result.portfolioProject.title}\n`;
    md += `${result.portfolioProject.concept}\n`;
    md += `Araçlar: ${result.portfolioProject.techStackOrTools.join(', ')}\n\n`;
    md += `## 30-60-90 Gün Yol Haritası\n`;
    md += `1. Ay: ${result.roadmap.month1.milestone}\n`;
    md += `2. Ay: ${result.roadmap.month2.milestone}\n`;
    md += `3. Ay: ${result.roadmap.month3.milestone}\n`;

    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Kariyer Eğitimi Analizi & Sonraki Adım Stratejisti</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Katıldığınız Eğitimlerin Müfredatına Dayalı Akıllı Tavsiye
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Şimdiye kadar aldığınız kursların, bootcamplerin veya sertifikaların içeriklerini girin.
            Yapay zeka hangi konularda yetkinleştiğinizi ve hedef rolünüz için hangi kritik parçaların
            eksik kaldığını saptasın. Tam olarak bir sonraki adımda almanız gereken eğitimi,
            içermesi gereken müfredat modüllerini ve portfolyo projenizi çıkarsın.
          </p>

          {/* Quick Presets */}
          <div className="mt-5 pt-4 border-t border-indigo-700/50">
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block mb-2">
              Hazır Eğitim Geçmişi Şablonları:
            </span>
            <div className="flex flex-wrap gap-2">
              {CAREER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-xs bg-indigo-700/40 hover:bg-indigo-600/60 border border-indigo-500/30 text-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3 h-3 text-indigo-300" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Career Context Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              Mevcut Pozisyon / Arka Plan
            </label>
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="Örn: Mid Frontend Developer..."
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              Hedef Pozisyon / Kariyer Adımı *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: Senior Fullstack & Cloud Architect..."
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Sektör / İlgi Alanı
            </label>
            <input
              type="text"
              value={industryOrDomain}
              onChange={(e) => setIndustryOrDomain(e.target.value)}
              placeholder="Örn: Modern Web, Bulut, FinTech..."
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Haftalık Öğrenme Zamanı
            </label>
            <select
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="Haftada 4-6 saat (Yoğun çalışan)">Haftada 4-6 saat (Yoğun çalışan)</option>
              <option value="Haftada 8-10 saat (Dengeli)">Haftada 8-10 saat (Dengeli)</option>
              <option value="Haftada 15+ saat (Hızlı İlerleme)">Haftada 15+ saat (Hızlı İlerleme)</option>
            </select>
          </div>
        </div>

        {/* Trainings List Header */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Tamamladığınız Eğitimler & Müfredat İçerikleri</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {trainings.length} Eğitim
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Eğitimlerde hangi konuların işlendiğini ne kadar detaylı yazarsanız, sonraki adım analizi o kadar isabetli olur.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-indigo-200/60"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Eğitim Ekle</span>
            </button>
          </div>

          {/* Add Training Inline Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddTraining}
              className="bg-indigo-50/40 rounded-2xl p-5 border border-indigo-200 mb-5 space-y-4 animate-in fade-in duration-200"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Yeni Eğitim / Kurs Detayı Ekle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                    Eğitim Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Örn: Docker & Kubernetes Başlangıçtan İleriye"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                    Veren Kurum / Platform
                  </label>
                  <input
                    type="text"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    placeholder="Örn: Udemy, Coursera, Kurum İçi..."
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                  Eğitimin İçeriği / İşlenen Konular & Müfredat *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Bu eğitimde hangi modüller vardı? Neler öğrendiniz? (Örn: Container mimarisi, Dockerfile, Docker Compose, K8s Pods, Deployments, Ingress controller, Helm charts...)"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                    Kazanılan Beceriler (Virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="Docker, Kubernetes, Containerization, Helm"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600 block mb-1">
                    Süre & Yıl
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="25 Saat - 2024"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700"
                >
                  Eğitimi Listeye Ekle
                </button>
              </div>
            </form>
          )}

          {/* Trainings Cards */}
          <div className="space-y-3">
            {trainings.map((tr) => (
              <TrainingCardItem
                key={tr.id}
                training={tr}
                onUpdate={handleUpdateTraining}
                onDelete={handleDeleteTraining}
              />
            ))}
          </div>
        </div>

        {/* Analyze Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            💡 Yapay zeka eğitimleriniz arasındaki boşlukları analiz ederek sıradaki en verimli adımı planlar.
          </p>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || trainings.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Müfredat & Boşluk Analizi Yapılıyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Eğitimleri Analiz Et & Sonraki Adımı Söyle</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                  <Compass className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Kariyer Koçu Değerlendirmesi
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Mevcut Seviye Analizi & Stratejik Yönlendirme
                  </h3>
                </div>
              </div>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors shadow-2xs"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Yol Haritası Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Raporu Kopyala (Markdown)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {result.executiveSummary}
            </p>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                Eğitimlerin Sonrasında Mevcut Yetkinlik Durumunuz:
              </h4>
              <p className="text-xs text-indigo-950 leading-relaxed">
                {result.currentLevelAssessment}
              </p>
            </div>
          </div>

          {/* Competency & Skill Gap Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mastered Skills */}
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Kazanılmış & Sağlam Beceriler
                </h4>
              </div>
              <p className="text-[11px] text-emerald-700">
                Alınan eğitimlerle temelini başarıyla attığınız ve pekiştirdiğiniz kaslar:
              </p>
              <div className="space-y-1.5">
                {result.competencyBreakdown.masteredSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white text-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-200/70 font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Gaps */}
            <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 space-y-3">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Hedef Rol İçin Kritik Boşluklar
                </h4>
              </div>
              <p className="text-[11px] text-rose-700">
                "{targetRole}" seviyesine geçmek için şu an en acil öğrenmeniz gereken konular:
              </p>
              <div className="space-y-1.5">
                {result.competencyBreakdown.criticalGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white text-rose-900 px-3 py-1.5 rounded-lg border border-rose-200/70 font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Redundancies */}
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100 space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Layers className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Tekrar Eden & Doygun Alanlar
                </h4>
              </div>
              <p className="text-[11px] text-amber-700">
                Artık zaman kaybetmemeniz gereken, yeterince eğitim aldığınız alanlar:
              </p>
              <div className="space-y-1.5">
                {result.competencyBreakdown.redundanciesOrOverlaps &&
                result.competencyBreakdown.redundanciesOrOverlaps.length > 0 ? (
                  result.competencyBreakdown.redundanciesOrOverlaps.map((red, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-white text-amber-900 px-3 py-1.5 rounded-lg border border-amber-200/70 font-medium flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span>{red}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-amber-800 italic bg-white p-2.5 rounded-lg border border-amber-200/60">
                    Eğitimleriniz arasında gereksiz bir örtüşme bulunmuyor.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* NEXT TRAINING RECOMMENDATIONS (THE CORE USER ASK) */}
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bir Sonraki Adım İçin Eğitim Yol Haritası</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Tam Olarak Nasıl Bir Eğitim Almalısınız?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Alınan kursların içeriklerine göre önceliklendirilmiş somut müfredat ve eğitim önerileri:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {result.nextTrainingRecommendations.map((rec, idx) => {
                const isFirstPriority = idx === 0;
                return (
                  <div
                    key={rec.id || idx}
                    className={`rounded-2xl p-6 sm:p-7 border transition-all ${
                      isFirstPriority
                        ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-indigo-700 shadow-lg'
                        : 'bg-white text-slate-900 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center ${
                            isFirstPriority
                              ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              isFirstPriority ? 'text-indigo-300' : 'text-indigo-600'
                            }`}
                          >
                            {rec.priority}
                          </span>
                          <h4 className="text-lg sm:text-xl font-extrabold">
                            {rec.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            isFirstPriority
                              ? 'bg-white/10 text-indigo-200 border border-white/10'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Tahmini Süre: {rec.estimatedDuration}</span>
                        </span>
                      </div>
                    </div>

                    {/* Why this next? */}
                    <div
                      className={`p-4 rounded-xl border mb-5 ${
                        isFirstPriority
                          ? 'bg-white/5 border-white/10 text-slate-200'
                          : 'bg-indigo-50/60 border-indigo-100 text-indigo-950'
                      }`}
                    >
                      <h5
                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                          isFirstPriority ? 'text-indigo-300' : 'text-indigo-800'
                        }`}
                      >
                        Neden Tam Olarak Bir Sonraki Adımda Bu Eğitim?
                      </h5>
                      <p className="text-xs sm:text-sm leading-relaxed">
                        {rec.whyThisNext}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {/* Target Curriculum Modules */}
                      <div
                        className={`p-4 rounded-xl border ${
                          isFirstPriority
                            ? 'bg-white/5 border-white/10'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <h5
                          className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                            isFirstPriority ? 'text-indigo-200' : 'text-slate-700'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          Alacağınız Eğitimin İçermesi Gereken Müfredat Modülleri:
                        </h5>
                        <ul className="space-y-2">
                          {rec.targetCurriculumModules.map((mod, mIdx) => (
                            <li
                              key={mIdx}
                              className={`text-xs flex items-start gap-2 ${
                                isFirstPriority ? 'text-slate-200' : 'text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                  isFirstPriority ? 'bg-indigo-400' : 'bg-indigo-600'
                                }`}
                              />
                              <span className="leading-snug">{mod}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Platforms & Gained Skills */}
                      <div className="space-y-4">
                        <div
                          className={`p-4 rounded-xl border ${
                            isFirstPriority
                              ? 'bg-white/5 border-white/10'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <h5
                            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                              isFirstPriority ? 'text-indigo-200' : 'text-slate-700'
                            }`}
                          >
                            Önerilen Platformlar & Akredite Sertifikalar:
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.suggestedPlatformsOrCertifications.map((plat, pIdx) => (
                              <span
                                key={pIdx}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                                  isFirstPriority
                                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/20'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                {plat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border ${
                            isFirstPriority
                              ? 'bg-white/5 border-white/10'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <h5
                            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                              isFirstPriority ? 'text-emerald-300' : 'text-emerald-800'
                            }`}
                          >
                            Kazanılacak Temel Yetkinlikler:
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.expectedSkillsGained.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                                  isFirstPriority
                                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/20'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hands-on Portfolio Project */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                <Code className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                  Pratik Uygulama & İspat
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Yeni Eğitimle Birlikte Yapılacak Portfolyo Projesi: "{result.portfolioProject.title}"
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {result.portfolioProject.concept}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100">
                <h5 className="font-bold uppercase tracking-wider text-purple-900 mb-2">
                  Kullanılacak Teknolojiler & Mimari
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {result.portfolioProject.techStackOrTools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-purple-900 px-2.5 py-1 rounded-md border border-purple-200 font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                <h5 className="font-bold uppercase tracking-wider text-emerald-900 mb-2">
                  İşe Alımcıları Neden Etkiler?
                </h5>
                <p className="text-emerald-950 leading-relaxed font-normal">
                  {result.portfolioProject.whyItImpressesRecruiters}
                </p>
              </div>
            </div>
          </div>

          {/* 30-60-90 Day Roadmap */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Zaman Çizelgesi
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Kişiselleştirilmiş 30-60-90 Günlük Gelişim Yol Haritası
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Month 1 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                      1. Ay (Gün 1-30)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {result.roadmap.month1.milestone}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                    {result.roadmap.month1.actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Month 2 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-indigo-800 text-white">
                      2. Ay (Gün 31-60)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {result.roadmap.month2.milestone}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                    {result.roadmap.month2.actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-700 mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Month 3 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-700 text-white">
                      3. Ay (Gün 61-90)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {result.roadmap.month3.milestone}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                    {result.roadmap.month3.actions.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
