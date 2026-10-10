import React, { useState, useEffect } from 'react';
import { InterviewQuestion, AnswerEvaluation } from '../../types';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  interviewerTitle: string;
  candidateRole: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  interviewerTitle,
  candidateRole,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'why' | 'star' | 'sample' | 'mock'>('why');
  const [copied, setCopied] = useState(false);

  // Mock interview state
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setRecognitionSupported(!!SpeechRecognition);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionSupported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isListening) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setCandidateAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        (window as any)._activeRecognition = recognition;
        recognition.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    } else {
      if ((window as any)._activeRecognition) {
        (window as any)._activeRecognition.stop();
      }
      setIsListening(false);
    }
  };

  const handleCopyQuestion = () => {
    navigator.clipboard.writeText(question.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setIsEvaluating(true);
    setEvalError(null);

    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          interviewerTitle,
          candidateRole,
          candidateAnswer: candidateAnswer.trim(),
          language: 'tr',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Cevap değerlendirilemedi.');
      }

      const data: AnswerEvaluation = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      setEvalError(err.message || 'Bir hata oluştu.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'kolay':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'orta':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'zor':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'uzman':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all overflow-hidden">
      {/* Question Header */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
              {index + 1}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {question.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuestion}
              title="Soruyu Kopyala"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (!isExpanded && activeTab !== 'mock') {
                  setActiveTab('why');
                }
              }}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>{isExpanded ? 'Detayları Gizle' : 'Koçluk Rehberi & Cevapla'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Title */}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          "{question.question}"
        </h4>
      </div>

      {/* Expanded Coaching & Mock Section */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3 mb-5">
            <button
              onClick={() => setActiveTab('why')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'why'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Neden Soruyor? & Kriterler</span>
            </button>

            <button
              onClick={() => setActiveTab('star')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'star'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>STAR Cevap Çerçevesi</span>
            </button>

            <button
              onClick={() => setActiveTab('sample')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'sample'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Örnek Güçlü Yanıt & Tuzaklar</span>
            </button>

            <button
              onClick={() => setActiveTab('mock')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto ${
                activeTab === 'mock'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cevabımı Test Et (Simülatör)</span>
            </button>
          </div>

          {/* TAB 1: Why they ask & evaluation criteria */}
          {activeTab === 'why' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5">
                  Görüşmecinin Asıl Amacı & Aradığı İpucu:
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {question.whyTheyAsk}
                </p>
              </div>

              {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Değerlendirme Kriterleri:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.evaluationCriteria.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STAR Framework */}
          {activeTab === 'star' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
                    S - Situation (Durum)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {question.starGuide.situation}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
                    T - Task (Görev)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {question.starGuide.task}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
                    A - Action (Eylem)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {question.starGuide.action}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-2xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                    R - Result (Sonuç & Metrik)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {question.starGuide.result}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Sample Strong Answer & Common Pitfalls */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Örnek Güçlü Yanıt Taslağı:
                </h5>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line italic bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
                  "{question.sampleStrongAnswer}"
                </p>
              </div>

              {question.commonPitfalls && question.commonPitfalls.length > 0 && (
                <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200/80">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Kaçınılması Gereken Tuzaklar ve Klişeler:
                  </h5>
                  <ul className="space-y-1.5">
                    {question.commonPitfalls.map((pitfall, idx) => (
                      <li key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{pitfall}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Interactive Mock Interview Practice */}
          {activeTab === 'mock' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Senin Yanıtın (Yaz veya Konuş):
                  </label>
                  {recognitionSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Dinliyor... Durdur</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Sesle Cevapla</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <textarea
                  value={candidateAnswer}
                  onChange={(e) => setCandidateAnswer(e.target.value)}
                  placeholder={`Mülakatta bu soruya nasıl cevap verirdin? Örn: "Önceki şirketimde benzer bir krizle karşılaştığımızda..."`}
                  rows={4}
                  className="w-full text-sm text-slate-800 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">
                    {candidateAnswer.length} karakter
                  </span>
                  <div className="flex items-center gap-2">
                    {candidateAnswer && (
                      <button
                        onClick={() => {
                          setCandidateAnswer('');
                          setEvaluation(null);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Temizle</span>
                      </button>
                    )}
                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !candidateAnswer.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEvaluating ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Koç Değerlendiriyor...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Cevabımı Değerlendir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {evalError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium">{evalError}</p>
                )}
              </div>

              {/* Evaluation Results Card */}
              {evaluation && (
                <div className="bg-white rounded-xl p-5 border border-indigo-200 shadow-md space-y-4 animate-in fade-in duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                        {evaluation.score}/10
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Mülakatçı Kararı
                        </span>
                        <h4 className="text-base font-bold text-slate-900">
                          {evaluation.verdict}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {interviewerTitle} Bakış Açısıyla
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 font-medium">
                    {evaluation.summary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                      <h6 className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Güçlü Yönlerin
                      </h6>
                      <ul className="space-y-1 text-emerald-900">
                        {evaluation.strengths.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                      <h6 className="font-bold text-amber-800 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Geliştirilecek Noktalar
                      </h6>
                      <ul className="space-y-1 text-amber-900">
                        {evaluation.areasForImprovement.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Interviewer Impression */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">
                      Görüşmecinin Zihninde Oluşan İntiba:
                    </span>
                    <p className="text-slate-600 italic">
                      "{evaluation.interviewerImpression}"
                    </p>
                  </div>

                  {/* Polished Rewrite */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <h6 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Koçun Revize Ettiği Üst Seviye Yanıt:
                    </h6>
                    <p className="text-xs text-indigo-950 leading-relaxed font-normal">
                      "{evaluation.improvedVersion}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
