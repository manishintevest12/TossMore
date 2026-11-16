import React, { useState } from 'react';
import { Award, CheckCircle2, FileCheck2, Lock } from 'lucide-react';
import type { CertificationState, LanguageCode, PendingCheckout, SportType } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface CertificationsViewProps {
  language: LanguageCode;
  certifications: CertificationState[];
  onEnroll: (checkout: PendingCheckout) => void;
  onCompleteModule: (certId: string) => Promise<void>;
  onSubmitExam: (certId: string, scorePct: number) => Promise<void>;
}

const EXAM_QUESTIONS = [
  {
    q: 'During high-velocity rotational or striking actions (cricket drive, golf swing, tennis serve), what anchors directional accuracy?',
    options: [
      'A still head position and sequenced hip-before-shoulders kinematic chain',
      'Maximizing upper-body tension before foot placement',
      'Looking away from the impact zone early',
    ],
    correctIdx: 0,
  },
  {
    q: 'In high-intensity field/mat sports (Football pressing, Kabaddi raiding), how do athletes protect joints during rapid deceleration?',
    options: [
      'Locking knees stiff on contact',
      'Lowering center of gravity with controlled knee flexion and eccentric hamstring load absorption',
      'Crossing ankles during lateral shuffles',
    ],
    correctIdx: 1,
  },
  {
    q: 'When officiating live matches under video/electronic review (DRS, VAR, mat cameras), what is the official protocol for inconclusive angles?',
    options: [
      'Award automatic penalty points',
      'Cancel the match period',
      'Uphold the original on-field official’s decision',
    ],
    correctIdx: 2,
  },
];

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  language,
  certifications,
  onEnroll,
  onCompleteModule,
  onSubmitExam,
}) => {
  const t = TRANSLATIONS[language];
  const [filterTrack, setFilterTrack] = useState<'All' | 'Player' | 'Coach' | 'Umpire' | 'Analyst'>('All');
  const [filterSport, setFilterSport] = useState<'All' | SportType>('All');
  const [activeExamCert, setActiveExamCert] = useState<CertificationState | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examMessage, setExamMessage] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<CertificationState | null>(null);

  const visible = certifications.filter(
    (c) =>
      (filterTrack === 'All' || c.track === filterTrack) &&
      (filterSport === 'All' || c.sport === filterSport)
  );

  const handleGradeExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamCert) return;
    let correct = 0;
    EXAM_QUESTIONS.forEach((item, idx) => {
      if (answers[idx] === item.correctIdx) correct += 1;
    });
    const scorePct = Math.round((correct / EXAM_QUESTIONS.length) * 100);
    await onSubmitExam(activeExamCert.id, scorePct);
    if (scorePct >= 70) {
      setExamMessage(`Passed with ${scorePct}%! Your verified credential has been issued.`);
      setPreviewCert({
        ...activeExamCert,
        passed: true,
        scorePct,
        issuedAt: new Date().toISOString().slice(0, 10),
        certificateCode: activeExamCert.certificateCode || 'APX-VERIFIED',
      });
      setActiveExamCert(null);
    } else {
      setExamMessage(`Scored ${scorePct}% (70% required to pass). Review the biomechanical cues and retry.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
            {t.sections.certHeadline}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Earn accredited degrees and official licenses across Cricket, Football, Kabaddi, Golf, and Athletics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            {(['All', 'Cricket', 'Football', 'Kabaddi', 'Golf', 'Athletics'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setFilterSport(sp)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filterSport === sp
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 p-1">
            {(['All', 'Player', 'Coach', 'Umpire', 'Analyst'] as const).map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setFilterTrack(track)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  filterTrack === track
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>
      </div>

      {examMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex items-center justify-between">
          <span>{examMessage}</span>
          <button
            type="button"
            onClick={() => setExamMessage(null)}
            className="text-xs font-semibold underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visible.map((cert) => {
          const pct = Math.round((cert.modulesCompleted / cert.modulesTotal) * 100);
          return (
            <div
              key={cert.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 space-y-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {cert.sport} · {cert.track} Track · {cert.level}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    ${cert.feeUsd}
                  </span>
                </div>
                <h2 className="font-display text-lg font-semibold text-slate-900">{cert.title}</h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Curriculum Progress</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {cert.modulesCompleted}/{cert.modulesTotal} modules ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {cert.passed ? (
                  <>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-mono">{cert.certificateCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewCert(cert)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>View Credential</span>
                    </button>
                  </>
                ) : cert.enrolled ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onCompleteModule(cert.id)}
                      disabled={cert.modulesCompleted >= cert.modulesTotal}
                      className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      Complete Next Module
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAnswers({});
                        setActiveExamCert(cert);
                      }}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                    >
                      Take Final Assessment
                    </button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Includes written, VR & live exam</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onEnroll({
                          description: `Degree Enrollment: ${cert.title}`,
                          amountUsd: cert.feeUsd,
                          kind: 'certification',
                          targetId: cert.id,
                        })
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
                    >
                      Enroll via Checkout (${cert.feeUsd})
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeExamCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white overflow-hidden max-h-[90vh] flex flex-col">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Accreditation Assessment: {activeExamCert.title}
                </h3>
                <p className="text-xs text-slate-500">70% passing threshold required for credential issuance</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveExamCert(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleGradeExam} className="p-6 space-y-6 overflow-y-auto">
              {EXAM_QUESTIONS.map((item, qIdx) => (
                <div key={item.q} className="space-y-2.5">
                  <div className="text-sm font-semibold text-slate-900">
                    0{qIdx + 1}. {item.q}
                  </div>
                  <div className="space-y-2">
                    {item.options.map((opt, oIdx) => (
                      <label
                        key={opt}
                        className={`flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                          answers[qIdx] === oIdx
                            ? 'border-emerald-600 bg-emerald-50 text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          required
                          checked={answers[qIdx] === oIdx}
                          onChange={() => setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                          className="mt-1 accent-emerald-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveExamCert(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Submit Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-xl rounded-xl border-2 border-emerald-700 bg-white p-8 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-700">
                TossMore Accredited Athletic Credential
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-900">
                {previewCert.title}
              </h3>
              <p className="text-sm text-slate-500">
                {previewCert.sport} · {previewCert.track} Track · {previewCert.level}
              </p>
            </div>
            <div className="py-4 border-y border-slate-200 space-y-1">
              <div className="text-xs text-slate-500">Awarded To</div>
              <div className="font-display text-xl font-semibold text-slate-900">Aarav Mehta</div>
              <div className="text-xs font-mono text-slate-600 tabular-nums">
                Score: {previewCert.scorePct ?? 100}% · Serial: {previewCert.certificateCode} · Issued {previewCert.issuedAt}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Close Credential
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
