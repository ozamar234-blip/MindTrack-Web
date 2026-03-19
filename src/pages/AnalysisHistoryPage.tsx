import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllAnalyses } from '../api/analysis';
import { getRelativeTime } from '../utils/helpers';
import { ArrowRight, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import type { AIAnalysisResponse } from '../types';

const TREND_CONFIG = {
  improving: { icon: TrendingDown, color: '#10B981', label: 'מגמה חיובית', bg: '#ECFDF5' },
  worsening: { icon: TrendingUp, color: '#EF4444', label: 'מגמה לתשומת לב', bg: '#FEF2F2' },
  stable: { icon: Minus, color: '#6B7280', label: 'יציב', bg: '#F3F4F6' },
};

interface HistoryEntry {
  id: string;
  analysis: AIAnalysisResponse;
  generated_at: string;
  events_analyzed: number;
}

function HistoryCard({ entry, isExpanded, onToggle }: {
  entry: HistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const summary = entry.analysis.analysis_summary;
  const trend = TREND_CONFIG[summary?.trend as keyof typeof TREND_CONFIG] || TREND_CONFIG.stable;
  const TrendIcon = trend.icon;
  const date = new Date(entry.generated_at);
  const dateStr = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        border: '1.5px solid #E5E7EB',
        marginBottom: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header - always visible */}
      <div
        onClick={onToggle}
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #7F13EC20, #2A19E620)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Brain size={22} style={{ color: '#7C3AED' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A1A1A' }}>
              {dateStr}
            </span>
            <div style={{
              background: trend.bg,
              color: trend.color,
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              <TrendIcon size={11} />
              {trend.label}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#9CA3AF' }}>
            <span>{timeStr}</span>
            <span>{entry.events_analyzed} אירועים</span>
            <span>{getRelativeTime(entry.generated_at)}</span>
          </div>
        </div>

        {isExpanded ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px' }}>
              {/* Summary stats */}
              <div style={{
                background: 'linear-gradient(135deg, #7F13EC, #2A19E6)',
                borderRadius: '16px',
                padding: '16px',
                color: 'white',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{summary?.total_events_analyzed || 0}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>אירועים</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{Number(summary?.avg_intensity || 0).toFixed(1)}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>עוצמה ממוצעת</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900 }}>{(entry.analysis.key_insights || []).length}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>תובנות</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
                  {summary?.trend_description}
                </p>
              </div>

              {/* Key insights */}
              {(entry.analysis.key_insights || []).length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', color: '#374151' }}>
                    💡 תובנות מרכזיות
                  </h4>
                  {(entry.analysis.key_insights || []).slice(0, 5).map((insight, i) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: '#F9FAFB',
                      borderRadius: '12px',
                      marginBottom: '6px',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                    }}>
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{insight.emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1F2937', marginBottom: '2px' }}>
                          {insight.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.5 }}>
                          {insight.body}
                        </div>
                        {insight.actionable_tip && (
                          <div style={{
                            marginTop: '6px',
                            padding: '6px 8px',
                            background: '#F0FDF4',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            color: '#166534',
                            fontWeight: 600,
                          }}>
                            💡 {insight.actionable_tip}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trigger equations preview */}
              {(entry.analysis.trigger_equations || []).length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', color: '#374151' }}>
                    ⚡ משוואות טריגר
                  </h4>
                  {(entry.analysis.trigger_equations || []).slice(0, 3).map((eq, i) => (
                    <div key={i} style={{
                      padding: '10px 12px',
                      background: eq.probability >= 0.7 ? '#FFFBEB' : '#F9FAFB',
                      border: `1px solid ${eq.probability >= 0.7 ? '#FCD34D' : '#E5E7EB'}`,
                      borderRadius: '12px',
                      marginBottom: '6px',
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                        {eq.factors.map((f, fi) => (
                          <span key={fi}>
                            <span style={{
                              background: '#F3F4F6',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}>{f}</span>
                            {fi < eq.factors.length - 1 && <span style={{ margin: '0 2px', fontWeight: 900, color: '#D97706' }}> + </span>}
                          </span>
                        ))}
                        <span style={{ fontWeight: 900, color: '#D97706' }}> = </span>
                        <span style={{
                          background: '#7C3AED',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 900,
                        }}>{Math.round(eq.probability * 100)}%</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{eq.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Positive findings */}
              {(entry.analysis.positive_findings || []).length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', color: '#374151' }}>
                    ✅ ממצאים חיוביים
                  </h4>
                  {entry.analysis.positive_findings.map((f, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: '#ECFDF5',
                      borderRadius: '10px',
                      marginBottom: '4px',
                      fontSize: '0.8rem',
                      color: '#065F46',
                      fontWeight: 600,
                      display: 'flex',
                      gap: '6px',
                    }}>
                      <span>{f.emoji}</span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AnalysisHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getAllAnalyses(user.id)
      .then(data => {
        setEntries(data);
        if (data.length > 0) setExpandedId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="page" style={{
      background: 'var(--bg-warm)',
      minHeight: '100dvh',
      paddingBottom: '120px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingTop: '8px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            cursor: 'pointer',
          }}
        >
          <ArrowRight size={20} />
        </button>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>היסטוריית ניתוחים</h1>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '1.3rem' }}>📋</span>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
        כל הניתוחים המעמיקים שנשמרו
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#7C3AED', margin: '0 auto' }} />
          <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: 700 }}>טוען היסטוריה...</p>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.6)',
            border: '2px dashed #D1D5DB',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
            אין ניתוחים שמורים עדיין
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
            הפעל ניתוח AI בדף הניתוח כדי ליצור את הניתוח הראשון שלך
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/analysis')}
            style={{
              padding: '14px 28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7F13EC, #2A19E6)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(127, 19, 236, 0.3)',
            }}
          >
            🧠 עבור לניתוח AI
          </motion.button>
        </motion.div>
      )}

      {!loading && entries.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            padding: '8px 12px',
            background: '#F3F4F6',
            borderRadius: '12px',
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B7280' }}>
              סה"כ {entries.length} ניתוחים שמורים
            </span>
          </div>

          {entries.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedId === entry.id}
              onToggle={() => setExpandedId(prev => prev === entry.id ? null : entry.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
