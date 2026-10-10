import { TrainingItem } from '../types';

export interface InterviewPreset {
  id: string;
  name: string;
  interviewerTitle: string;
  candidateRole: string;
  seniorityLevel: string;
  companyType: string;
  interviewStage: string;
}

export const INTERVIEWER_TITLE_SUGGESTIONS = [
  'Engineering Director / CTO',
  'Engineering Manager (Yazılım Mühendisliği Müdürü)',
  'Senior Lead Frontend / Fullstack Architect',
  'Head of Product / CPO (Ürün Direktörü)',
  'Lead Product Manager',
  'İnsan Kaynakları Direktörü / HRBP',
  'Talent Acquisition Lead (Yetenek Kazanımı Lideri)',
  'Lead Data Scientist / AI Lead',
  'CEO / Co-founder (Startup Kurucu)',
  'Scrum Master / Agile Coach',
  'Senior UX / Design Lead',
  'DevOps / Cloud Infrastructure Lead',
];

export const INTERVIEW_PRESETS: InterviewPreset[] = [
  {
    id: 'cto-senior-dev',
    name: 'CTO Görüşmesi (Senior Developer Rolü)',
    interviewerTitle: 'Chief Technology Officer (CTO)',
    candidateRole: 'Senior Fullstack Software Engineer',
    seniorityLevel: 'Senior (5+ Yıl)',
    companyType: 'B2B SaaS Ölçeklenme Aşamasındaki Şirket',
    interviewStage: 'Teknik Mimari & Stratejik Vizyon Mülakatı',
  },
  {
    id: 'cpo-pm',
    name: 'Head of Product Görüşmesi (Product Manager Rolü)',
    interviewerTitle: 'Head of Product / CPO',
    candidateRole: 'Product Manager',
    seniorityLevel: 'Mid-Senior (3-5 Yıl)',
    companyType: 'FinTech & Dijital Ödeme Sistemleri',
    interviewStage: 'Ürün Stratejisi & Metrik Odaklı Case Mülakatı',
  },
  {
    id: 'hrbp-leadership',
    name: 'İK Direktörü (Takım Lideri & Kültür Mülakatı)',
    interviewerTitle: 'HR Business Partner (İK Direktörü)',
    candidateRole: 'Technical Team Lead',
    seniorityLevel: 'Lead / Yönetici Adayı',
    companyType: 'Uluslararası Kurumsal Teknoloji Şirketi',
    interviewStage: 'Davranışsal, Liderlik & Kültür Uyumu',
  },
  {
    id: 'lead-ds-analyst',
    name: 'Lead Data Scientist (Yapay Zeka / Veri Rolü)',
    interviewerTitle: 'Lead Data Scientist',
    candidateRole: 'Data Scientist & Machine Learning Specialist',
    seniorityLevel: 'Mid-Level (2-4 Yıl)',
    companyType: 'E-Ticaret & Tavsiye Motorları',
    interviewStage: 'Model Mimarisi & Veri Kalitesi Mülakatı',
  },
];

export interface CareerPreset {
  id: string;
  name: string;
  currentRole: string;
  targetRole: string;
  industryOrDomain: string;
  hoursPerWeek: string;
  trainings: TrainingItem[];
}

export const CAREER_PRESETS: CareerPreset[] = [
  {
    id: 'frontend-to-fullstack-cloud',
    name: 'Frontend Geliştirici ➔ Fullstack & Cloud Architect',
    currentRole: 'Mid-Level Frontend Developer (React/TS)',
    targetRole: 'Senior Fullstack Software Engineer & Cloud Architect',
    industryOrDomain: 'Modern Web, Mikroservisler & Bulut Sistemleri',
    hoursPerWeek: 'Haftada 8-10 saat',
    trainings: [
      {
        id: 'tr-1',
        title: 'Modern React 19 & TypeScript Derinlemesine',
        provider: 'Frontend Masters & Udemy',
        contentSummary: 'React hooks (useState, useEffect, useMemo), Custom Hooks, Context API, Redux Toolkit mimarisi, TypeScript generics ve state yönetimi, component optimizasyonu.',
        durationOrYear: '40 Saat - 2024',
        skillsLearned: ['React', 'TypeScript', 'Redux Toolkit', 'Performance Profiling', 'Tailwind CSS'],
      },
      {
        id: 'tr-2',
        title: 'Node.js & Express REST API Geliştirme Temelleri',
        provider: 'Coursera / Meta Backend Specialization',
        contentSummary: 'Express routing, middleware mekanizması, MongoDB ve Mongoose ile CRUD işlemleri, JWT authentication, temel hata yönetimi ve Postman testleri.',
        durationOrYear: '30 Saat - 2025',
        skillsLearned: ['Node.js', 'Express', 'RESTful API', 'JWT Auth', 'MongoDB'],
      },
      {
        id: 'tr-3',
        title: 'Git, GitHub Actions ve Temel Web Güvenliği',
        provider: 'Kurum İçi Workshop & YouTube Series',
        contentSummary: 'Git branching stratejileri (Gitflow), temel CI pipeline kurulumu, OWASP Top 10 web güvenlik açıkları, XSS ve CSRF korumaları.',
        durationOrYear: '15 Saat - 2025',
        skillsLearned: ['Gitflow', 'Basic CI/CD', 'OWASP Top 10', 'Web Security'],
      },
    ],
  },
  {
    id: 'data-analyst-to-ml',
    name: 'Veri Analisti ➔ Machine Learning & AI Mühendisi',
    currentRole: 'Veri Analisti (SQL, Tableau, Excel)',
    targetRole: 'Machine Learning & Yapay Zeka Mühendisi',
    industryOrDomain: 'Büyük Veri, Finans & Predictive Analytics',
    hoursPerWeek: 'Haftada 10-12 saat',
    trainings: [
      {
        id: 'tr-4',
        title: 'İleri Seviye SQL ve Veritabanı Sorgulama',
        provider: 'DataCamp',
        contentSummary: 'Window functions, CTEs, complex joins, query optimization, PostgreSQL ve indexleme yapıları.',
        durationOrYear: '25 Saat - 2024',
        skillsLearned: ['Advanced SQL', 'Window Functions', 'PostgreSQL', 'Data Warehousing'],
      },
      {
        id: 'tr-5',
        title: 'Python for Data Analysis & Pandas / NumPy',
        provider: 'Udemy / Jose Portilla',
        contentSummary: 'Pandas ile veri manipülasyonu, NumPy matris operasyonları, Matplotlib & Seaborn görselleştirme, eksik veri temizleme teknikleri.',
        durationOrYear: '35 Saat - 2024',
        skillsLearned: ['Python', 'Pandas', 'NumPy', 'Data Cleaning', 'Exploratory Data Analysis'],
      },
      {
        id: 'tr-6',
        title: 'İş Zekası ve Dashboard Tasarımı (PowerBI & Tableau)',
        provider: 'Coursera / Google Data Analytics',
        contentSummary: 'KPI tanımlamaları, DAX formülleri, interaktif dashboard dizaynı, iş paydaşlarına rapor sunum teknikleri.',
        durationOrYear: '30 Saat - 2025',
        skillsLearned: ['PowerBI', 'Tableau', 'Business Intelligence', 'Storytelling with Data'],
      },
    ],
  },
  {
    id: 'junior-pm-to-technical-pm',
    name: 'Junior Ürün Uzmanı ➔ Senior / Teknik Ürün Yöneticisi',
    currentRole: 'Junior Product Specialist / Associate PM',
    targetRole: 'Senior Technical Product Manager (TPM)',
    industryOrDomain: 'B2B SaaS & Platform Teknolojileri',
    hoursPerWeek: 'Haftada 6-8 saat',
    trainings: [
      {
        id: 'tr-7',
        title: 'Agile & Scrum Temelleri ve Product Owner Eğitimi',
        provider: 'Scrum.org / PSPO Hazırlık',
        contentSummary: 'Sprint planlama, backlog yönetimi, user story yazımı, kabul kriterleri belirleme, burndown chart takibi, retrospektif yönetimi.',
        durationOrYear: '20 Saat - 2024',
        skillsLearned: ['Scrum', 'Backlog Refinement', 'User Stories', 'Agile Product Management'],
      },
      {
        id: 'tr-8',
        title: 'Kullanıcı Araştırması ve Figma ile Tel Kafes (Wireframing)',
        provider: 'Interaction Design Foundation',
        contentSummary: 'Müşteri mülakatları, persona oluşturma, user journey mapping, Figma üzerinde düşük ve orta sadakatli prototip tasarlama.',
        durationOrYear: '25 Saat - 2024',
        skillsLearned: ['User Research', 'Figma', 'Wireframing', 'Customer Journey'],
      },
    ],
  },
];
