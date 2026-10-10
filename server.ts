import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient wrapper with exponential backoff for transient spikes
async function generateWithRetry(params: any, retries = 2, initialDelay = 1200) {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        (err?.message && (err.message.includes('high demand') || err.message.includes('quota')));
      if (isTransient && attempt < retries) {
        console.warn(`Transient API error (${err?.status || err?.message}), retrying attempt ${attempt + 2}...`);
        await new Promise((r) => setTimeout(r, initialDelay * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.GEMINI_API_KEY });
});

// 1. Generate Interview Questions tailored to Interviewer's Title
app.post('/api/interview/generate-questions', async (req: Request, res: Response) => {
  try {
    const {
      interviewerTitle,
      candidateRole,
      companyType = 'Genel Teknoloji Şirketi',
      seniorityLevel = 'Mid-Senior',
      interviewStage = 'Teknik & Fonksiyonel',
      language = 'tr',
    } = req.body;

    if (!interviewerTitle || !candidateRole) {
      return res.status(400).json({
        error: 'interviewerTitle and candidateRole are required parameters.',
      });
    }

    const systemInstruction = `You are an elite Executive Interview Coach and Hiring Bar Raiser with 20+ years of talent acquisition experience across Fortune 500, top startups, and tech companies.
Your mission is to analyze the exact mindset, biases, priorities, and pain points of the interviewer having the title: "${interviewerTitle}".
Generate realistic, high-impact interview questions that someone in this EXACT title would ask a candidate applying for "${candidateRole}" (${seniorityLevel}) at a "${companyType}" company during the "${interviewStage}" stage.
Output must be in Turkish (or English if requested, but match language: ${language}). All explanations must be deeply practical, actionable, and revealing the hidden psychology of this specific interviewer.`;

    const prompt = `Analiz Et ve Soruları Üret:
- Görüşmeci Ünvanı (Interviewer Title): ${interviewerTitle}
- Adayın Başvurduğu Rol: ${candidateRole}
- Deneyim Seviyesi: ${seniorityLevel}
- Şirket / Sektör Türü: ${companyType}
- Mülakat Aşaması: ${interviewStage}

Lütfen:
1. Görüşmecinin profilini, bu unvanın en çok korktuğu riskleri ve en çok aradığı özellikleri analiz et.
2. Bu ünvanın bizzat soracağı 6 ila 8 adet keskin, özgün soru üret (Kategoriler: Teknik/Fonksiyonel Derinlik, Karar Alma & Strateji, Davranışsal/STAR, Takım & İletişim, Zorlayıcı/Ters Köşe).
3. Her soru için mülakatçının asıl amacını, STAR yöntemine göre nasıl cevaplanacağını ve örnek güçlü bir yanıt taslağını ver.
4. Adayın bu unvana sahip mülakatçıya görüşme sonunda sorabileceği 4 adet zekice soru öner.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interviewerProfile: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                primaryFocus: { type: Type.STRING, description: 'Bu unvanın bu mülakattaki en öncelikli odak noktası ve psikolojisi' },
                evaluates: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Bu unvanın adayda aradığı 3-4 kilit yetkinlik',
                },
                redFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Bu unvan için adayı anında eleyebilecek 2-3 kırmızı bayrak',
                },
                winningMindset: { type: Type.STRING, description: 'Bu mülakatçıyı etkilemek için gereken zihniyet ve ton' },
              },
              required: ['title', 'primaryFocus', 'evaluates', 'redFlags', 'winningMindset'],
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  question: { type: Type.STRING },
                  whyTheyAsk: { type: Type.STRING, description: 'Mülakatçının bu sorudaki asıl amacı ve psikolojisi' },
                  evaluationCriteria: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  starGuide: {
                    type: Type.OBJECT,
                    properties: {
                      situation: { type: Type.STRING },
                      task: { type: Type.STRING },
                      action: { type: Type.STRING },
                      result: { type: Type.STRING },
                    },
                    required: ['situation', 'task', 'action', 'result'],
                  },
                  sampleStrongAnswer: { type: Type.STRING, description: 'Aday için örnek güçlü, etkileyici cevap taslağı' },
                  commonPitfalls: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Yapılmaması gereken hatalar veya klişeler',
                  },
                },
                required: ['id', 'category', 'difficulty', 'question', 'whyTheyAsk', 'starGuide', 'sampleStrongAnswer', 'commonPitfalls'],
              },
            },
            candidateQuestionsToAsk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  whyItImpresses: { type: Type.STRING },
                },
                required: ['question', 'whyItImpresses'],
              },
            },
          },
          required: ['interviewerProfile', 'questions', 'candidateQuestionsToAsk'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    return res.status(500).json({
      error: error.message || 'Mülakat soruları üretilirken bir hata oluştu.',
    });
  }
});

// 2. Evaluate Candidate's Answer in Mock Interview Mode
app.post('/api/interview/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { question, interviewerTitle, candidateRole, candidateAnswer, language = 'tr' } = req.body;

    if (!question || !candidateAnswer || !interviewerTitle) {
      return res.status(400).json({
        error: 'question, interviewerTitle, and candidateAnswer are required.',
      });
    }

    const systemInstruction = `You are an expert interview coach giving rigorous, constructive feedback from the perspective of an interviewer with the title: "${interviewerTitle}".
Evaluate the candidate's answer for the role "${candidateRole}".
Language: ${language}.
Provide a balanced critique with practical improvements, STAR framework alignment, and a rewritten high-impact answer.`;

    const prompt = `Görüşmeci Ünvanı: ${interviewerTitle}
Aday Rolü: ${candidateRole}
Soru: ${question}
Adayın Verdiği Cevap: ${candidateAnswer}

Lütfen bu cevabı mülakatçının bakış açısıyla detaylı puanla ve değerlendir.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: '1 ile 10 arasında puan' },
            verdict: { type: Type.STRING, description: 'Örn: "Çok Güçlü & İkna Edici", "Geliştirilebilir", "Kritik Eksikler Var"' },
            summary: { type: Type.STRING, description: 'Kısa koçluk özeti' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Cevabın güçlü yönleri',
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Eksik veya geliştirilmesi gereken noktalar',
            },
            interviewerImpression: { type: Type.STRING, description: 'Görüşmecinin zihninde uyanan intiba' },
            improvedVersion: { type: Type.STRING, description: 'Aynı cevabın profesyonel, STAR uyumlu revize edilmiş hali' },
            quickTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Sonraki sefere uygulanabilecek 2-3 hızlı taktik',
            },
          },
          required: ['score', 'verdict', 'summary', 'strengths', 'areasForImprovement', 'interviewerImpression', 'improvedVersion', 'quickTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({
      error: error.message || 'Cevap değerlendirilirken bir hata oluştu.',
    });
  }
});

// 3. Career & Training Pathway Coach: Analyze Completed Trainings and Recommend Next Educational Steps
app.post('/api/career/analyze-training', async (req: Request, res: Response) => {
  try {
    const {
      trainings,
      currentRole = 'Mevcut Pozisyon Belirtilmedi',
      targetRole = 'Kariyer Hedefi',
      industryOrDomain = 'Teknoloji / Yazılım',
      learningPreferences = {},
      language = 'tr',
    } = req.body;

    if (!trainings || !Array.isArray(trainings) || trainings.length === 0) {
      return res.status(400).json({
        error: 'Lütfen analiz için katıldığınız en az bir eğitim/kurs bilgisi girin.',
      });
    }

    const systemInstruction = `You are a Senior Career Strategist, Tech Curriculum Architect, and Professional Development Coach.
The user will provide a list of completed trainings, courses, workshops, or certifications they have completed, along with their curriculum/content details.
Your job is to:
1. Synthesize what competencies they have truly mastered based on those course contents.
2. Identify critical skill gaps, theoretical holes, or practical oversights needed for their target goal: "${targetRole}".
3. Prescribe EXACTLY what training / course / topic they should take as their immediate NEXT step (Bir Sonraki Adım İçin Eğitim Önerisi). Provide detailed curriculum outlines, specific modules, and rationale.
4. Recommend a hands-on portfolio project to solidify the new learning.
5. Provide a clear 30-60-90 Day career learning roadmap.
Language: ${language}. Deliver inspirational, rigorous, and highly actionable advice.`;

    const prompt = `Kullanıcı Bilgileri ve Katıldığı Eğitimler:
Mevcut Pozisyon/Durum: ${currentRole}
Hedef Pozisyon / Kariyer Adımı: ${targetRole}
Sektör / Alan: ${industryOrDomain}
Öğrenme Tercihleri: ${JSON.stringify(learningPreferences)}

Katılınan Eğitimler ve İçerikleri:
${JSON.stringify(trainings, null, 2)}

Lütfen bu eğitim içeriklerini derinlemesine analiz et ve bir sonraki adım için eksiksiz bir eğitim tavsiyesi ve kariyer gelişim stratejisi hazırla.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: 'Kariyer koçunun adaya özel stratejik değerlendirme özeti' },
            currentLevelAssessment: { type: Type.STRING, description: 'Alınan eğitimler sonrası mevcut yetkinlik seviyesi analizi' },
            competencyBreakdown: {
              type: Type.OBJECT,
              properties: {
                masteredSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Alınan eğitimlerden sağlam şekilde kazanılan beceriler',
                },
                criticalGaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Hedefe ulaşmak için eksik kalan kritik bilgi/beceri boşlukları',
                },
                redundanciesOrOverlaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Zaten fazlasıyla pekiştirilmiş, tekrar eğitim alınmasına gerek olmayan konular',
                },
              },
              required: ['masteredSkills', 'criticalGaps'],
            },
            nextTrainingRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING, description: 'Önerilen Eğitimin / Konunun Başlığı' },
                  priority: { type: Type.STRING, description: 'Örn: "1. Öncelik (Hemen Alınmalı)", "2. Öncelik", "Tamamlayıcı"' },
                  whyThisNext: { type: Type.STRING, description: 'Neden tam olarak önceki eğitimlerden sonra bu eğitim alınmalı?' },
                  targetCurriculumModules: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Bu eğitimin içinde kesinlikle bulunması gereken modül/konu başlıkları',
                  },
                  expectedSkillsGained: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  suggestedPlatformsOrCertifications: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Örnek platformlar, akredite sertifikalar veya kaynaklar',
                  },
                  estimatedDuration: { type: Type.STRING },
                },
                required: ['id', 'title', 'priority', 'whyThisNext', 'targetCurriculumModules', 'expectedSkillsGained', 'suggestedPlatformsOrCertifications', 'estimatedDuration'],
              },
            },
            portfolioProject: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                concept: { type: Type.STRING },
                techStackOrTools: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                deliverables: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                whyItImpressesRecruiters: { type: Type.STRING },
              },
              required: ['title', 'concept', 'techStackOrTools', 'deliverables', 'whyItImpressesRecruiters'],
            },
            roadmap: {
              type: Type.OBJECT,
              properties: {
                month1: {
                  type: Type.OBJECT,
                  properties: {
                    milestone: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['milestone', 'actions'],
                },
                month2: {
                  type: Type.OBJECT,
                  properties: {
                    milestone: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['milestone', 'actions'],
                },
                month3: {
                  type: Type.OBJECT,
                  properties: {
                    milestone: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ['milestone', 'actions'],
                },
              },
              required: ['month1', 'month2', 'month3'],
            },
          },
          required: ['executiveSummary', 'currentLevelAssessment', 'competencyBreakdown', 'nextTrainingRecommendations', 'portfolioProject', 'roadmap'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing training pathway:', error);
    return res.status(500).json({
      error: error.message || 'Eğitim analiz edilirken bir hata oluştu.',
    });
  }
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Interview & Career Coach server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
