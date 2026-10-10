import React, { useState } from 'react';
import { TrainingItem } from '../../types';
import { BookOpen, Trash2, Edit3, Check, X, Tag } from 'lucide-react';

interface TrainingCardItemProps {
  training: TrainingItem;
  onUpdate: (updated: TrainingItem) => void;
  onDelete: (id: string) => void;
}

export const TrainingCardItem: React.FC<TrainingCardItemProps> = ({
  training,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(training.title);
  const [editedProvider, setEditedProvider] = useState(training.provider);
  const [editedContent, setEditedContent] = useState(training.contentSummary);
  const [editedDuration, setEditedDuration] = useState(training.durationOrYear);
  const [editedSkills, setEditedSkills] = useState(training.skillsLearned.join(', '));

  const handleSave = () => {
    onUpdate({
      ...training,
      title: editedTitle.trim() || 'Eğitim Adı Belirtilmedi',
      provider: editedProvider.trim() || 'Genel',
      contentSummary: editedContent.trim(),
      durationOrYear: editedDuration.trim(),
      skillsLearned: editedSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(training.title);
    setEditedProvider(training.provider);
    setEditedContent(training.contentSummary);
    setEditedDuration(training.durationOrYear);
    setEditedSkills(training.skillsLearned.join(', '));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Eğitim / Kurs Adı
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Veren Kurum / Platform
            </label>
            <input
              type="text"
              value={editedProvider}
              onChange={(e) => setEditedProvider(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
            İçerik & Tamamlanan Müfredat Özeti
          </label>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            placeholder="İşlenen konular, modüller, projeler..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Kazanılan Beceriler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={editedSkills}
              onChange={(e) => setEditedSkills(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
              Süre / Yıl
            </label>
            <input
              type="text"
              value={editedDuration}
              onChange={(e) => setEditedDuration(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
            <span>İptal</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded-lg flex items-center gap-1 hover:bg-indigo-700"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700 mt-0.5 shrink-0">
            <BookOpen className="w-4 h-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-sm font-bold text-slate-900 leading-snug">
                {training.title}
              </h5>
              <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                {training.provider}
              </span>
              {training.durationOrYear && (
                <span className="text-[11px] text-slate-400">
                  • {training.durationOrYear}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700 block mb-0.5">İçerik Detayları:</span>
              {training.contentSummary || 'İçerik girilmedi.'}
            </p>

            {training.skillsLearned && training.skillsLearned.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {training.skillsLearned.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-100"
                  >
                    <Tag className="w-2.5 h-2.5 text-indigo-500" />
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            title="Düzenle"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(training.id)}
            title="Sil"
            className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
