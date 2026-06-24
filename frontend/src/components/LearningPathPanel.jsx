import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendCoursesForUser, savePreferredLearningStyles } from '../lib/learningPathApi';
import LearningStyleChips from './LearningStyleChips';
import { LEARNING_STYLES } from '../lib/teachingStudio';
import { deliveryModeById, formatDeliverySummary } from '../lib/teachingStudio';

export default function LearningPathPanel({ user, compact = false }) {
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(false);
  const [styles, setStyles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) {
      setResult(null);
      return;
    }
    recommendCoursesForUser(user.email, { limit: compact ? 3 : 6 })
      .then(setResult)
      .catch(() => setResult(null));
  }, [user?.email, compact]);

  const saveStyles = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await savePreferredLearningStyles(user.email, styles);
      setEditing(false);
      const next = await recommendCoursesForUser(user.email, { limit: compact ? 3 : 6 });
      setResult(next);
    } catch {
      /* ignore */
    }
    setSaving(false);
  };

  if (!user?.email) {
    return (
      <div className="rounded-3xl border border-[#c9a227]/25 bg-[#f5f0e8]/60 p-6 text-center">
        <p className="text-sm text-gray-600">
          <Link to="/login" className="text-[#4a1942] font-medium underline">Sign in</Link>
          {' '}to get course recommendations matched to how you learn best.
        </p>
      </div>
    );
  }

  const courses = result?.courses || [];

  return (
    <section
      className={compact ? 'mb-6' : 'mb-10 rounded-3xl border border-[#4a1942]/15 bg-gradient-to-br from-white to-[#f5f0e8]/80 p-6 sm:p-8'}
      aria-labelledby="learning-path-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-mono tracking-[2px] uppercase text-[#c9a227] mb-1">Your path</p>
          <h2 id="learning-path-heading" className="text-xl font-semibold heading-font text-[#4a1942]">
            Courses for how you learn
          </h2>
          {result?.reason === 'learning_style_match' && result.styleLabels?.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Matched to: {result.styleLabels.join(', ')}
            </p>
          )}
          {result?.reason === 'popular' && (
            <p className="text-sm text-gray-600 mt-1">
              Set your learning styles below for personalized picks.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setStyles(result?.profile?.styles || []);
            setEditing((v) => !v);
          }}
          className="text-sm text-[#4a1942] underline min-h-[44px] px-2"
        >
          {editing ? 'Cancel' : 'Edit learning styles'}
        </button>
      </div>

      {editing && (
        <div className="mb-6 p-4 bg-white border rounded-2xl">
          <p className="text-sm text-gray-600 mb-3">
            VARK+ styles — we recommend courses that match visual, auditory, hands-on, social, or solitary learning.
          </p>
          <LearningStyleChips
            value={styles}
            onChange={setStyles}
            label="How you learn best (VARK+)"
          />
          <button
            type="button"
            onClick={saveStyles}
            disabled={saving}
            className="mt-4 px-5 py-2.5 bg-[#4a1942] text-white rounded-xl text-sm min-h-[44px]"
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </div>
      )}

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
        {courses.map((c) => (
          <Link
            key={c.id}
            to={`/courses/${c.id}`}
            className="block p-4 bg-white border border-[#c9a227]/15 rounded-2xl hover:shadow-md transition"
          >
            <h3 className="font-semibold text-[#2d1230]">{c.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
            {c.delivery_modes?.length > 0 && (
              <p className="text-[10px] text-[#4a1942]/80 mt-2 uppercase tracking-wide">
                {formatDeliverySummary(c.delivery_modes)}
              </p>
            )}
            {c.learning_styles?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {c.learning_styles.slice(0, 3).map((id) => (
                  <span key={id} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f0e8] text-[#4a1942]">
                    {LEARNING_STYLES.find((s) => s.id === id)?.label || id}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {!courses.length && (
        <p className="text-sm text-gray-500">No published courses yet — practitioners are preparing the Sanctum.</p>
      )}

      {!compact && (
        <Link to="/courses" className="inline-block mt-6 text-sm font-medium text-[#4a1942]">
          Browse all courses →
        </Link>
      )}
    </section>
  );
}