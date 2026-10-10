import React from 'react';
import { InterviewerProfile } from '../../types';
import { UserCheck, ShieldAlert, Award, Compass, Eye } from 'lucide-react';

interface InterviewerProfileCardProps {
  profile: InterviewerProfile;
}

export const InterviewerProfileCard: React.FC<InterviewerProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left Side: Profile & Focus */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Görüşmeci Zihniyeti & Öncelik Analizi
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {profile.title}
              </h3>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Temel Odak Noktası & Psikolojisi
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {profile.primaryFocus}
                </p>
              </div>
            </div>
          </div>

          {/* Winning Mindset */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                  Bu Kişiyi Kazandıran Zihniyet (Winning Mindset)
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  {profile.winningMindset}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Evaluates & Red Flags */}
        <div className="lg:w-96 flex flex-col gap-4">
          {/* Critical Evaluation Points */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 mb-2.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Adayda Bizzat Ölçtüğü Boyutlar
            </h4>
            <ul className="space-y-1.5">
              {profile.evaluates.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red Flags to Avoid */}
          <div className="bg-rose-50/60 rounded-xl p-4 border border-rose-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-2 mb-2.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Bu Ünvan İçin Kırmızı Bayraklar (Red Flags)
            </h4>
            <ul className="space-y-1.5">
              {profile.redFlags.map((flag, idx) => (
                <li key={idx} className="text-xs text-rose-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
