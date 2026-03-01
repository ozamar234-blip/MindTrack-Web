import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAnalysis } from '../hooks/useAnalysis';
import { getRelativeTime } from '../utils/helpers';
import { ANALYSIS_CONFIG } from '../api/analysis';
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, Info, AlertCircle, Lightbulb, Shield, Zap, Download, Share2, Check, Loader2 } from 'lucide-react';
import type { AIAnalysisResponse, KeyInsight, TriggerEquation } from '../types';

// ═══════════════════════════════════════════
// Color & Style Helpers
// ═══════════════════════════════════════════

const SEVERITY_COLORS = {
  info: { bg: '#EBF5FF', border: '#BFDBFE', text: '#1E40AF', dot: '#3B82F6' },
  attention: { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#F59E0B' },
  important: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444' },
};

const CATEGORY_LABELS: Record<string, string> = {
  sleep: '🌙 שינה',
  food: '🍽️ תזונה',
  stress: '😰 מתח',
  time: '📅 זמן',
  location: '📍 מיקום',
  symptoms: '🔔 סימפטומים',
  mood: '💭 מצב רוח',
  cross_correlation: '🧠 קורלציה צולבת',
};

const TREND_CONFIG = {
  improving: { icon: TrendingDown, color: '#10B981', label: 'מגמה חיובית', bg: '#ECFDF5' },
  worsening: { icon: TrendingUp, color: '#EF4444', label: 'מגמה לתשומת לב', bg: '#FEF2F2' },
  stable: { icon: Minus, color: '#6B7280', label: 'יציב', bg: '#F3F4F6' },
};

const SEVERITY_ICONS = {
  info: Info,
  attention: AlertTriangle,
  important: AlertCircle,
};

// ═══════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════

function SummaryCard({ summary }: { summary: AIAnalysisResponse['analysis_summary'] }) {
  const trend = TREND_CONFIG[summary.trend] || TREND_CONFIG.stable;
  const TrendIcon = trend.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        background: 'linear-gradient(135deg, #7F13EC, #2A19E6)',
        borderRadius: '24px',
        padding: '24px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 12px 40px rgba(127, 19, 236, 0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.85rem', opacity: 0.8, fontWeight: 600 }}>{summary.date_range}</span>
        <div style={{
          background: trend.bg,
          color: trend.color,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <TrendIcon size={14} />
          {trend.label}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{summary.total_events_analyzed}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>אירועים</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{Number(summary.avg_intensity || 0).toFixed(1)}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>עוצמה ממוצעת</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>7</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>ממדי ניתוח</div>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
        {summary.trend_description}
      </p>
    </motion.div>
  );
}

function InsightCard({ insight, index }: { insight: KeyInsight; index: number }) {
  const severity = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.info;
  const SeverityIcon = SEVERITY_ICONS[insight.severity] || SEVERITY_ICONS.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.08 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        border: `1.5px solid ${severity.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>{insight.emoji}</span>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1A1A1A', lineHeight: 1.3 }}>
            {insight.title}
          </h3>
        </div>
        <div style={{
          background: severity.bg,
          color: severity.text,
          padding: '3px 8px',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}>
          <SeverityIcon size={12} />
          {insight.severity === 'important' ? 'חשוב' : insight.severity === 'attention' ? 'תשומת לב' : 'מידע'}
        </div>
      </div>

      {/* Category badge */}
      <div style={{
        display: 'inline-block',
        background: '#F5F3FF',
        color: '#6D28D9',
        padding: '2px 10px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 700,
        marginBottom: '12px',
      }}>
        {CATEGORY_LABELS[insight.category] || insight.category}
      </div>

      {/* Body */}
      <p style={{
        fontSize: '0.9rem',
        lineHeight: 1.7,
        color: '#374151',
        margin: '0 0 16px 0',
      }}>
        {insight.body}
      </p>

      {/* Data Points */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: '12px',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#7C3AED' }}>
            {insight.data_points?.statistic || '—'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{insight.data_points?.comparison || ''}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>מדגם</div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>{insight.data_points?.sample_size || '—'}</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: '12px' }}>
        {(() => {
          const conf = Math.min(1, Math.max(0, insight.confidence || 0));
          return (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9CA3AF', marginBottom: '4px' }}>
              <span>רמת ביטחון</span>
              <span style={{ fontWeight: 700 }}>{Math.round(conf * 100)}%</span>
            </div>
            <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${conf * 100}%`,
                background: conf > 0.7 ? '#10B981' : conf > 0.5 ? '#F59E0B' : '#EF4444',
                borderRadius: '2px',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </>);
        })()}
      </div>

      {/* Actionable Tip */}
      <div style={{
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '10px 12px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
      }}>
        <Lightbulb size={16} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5, fontWeight: 600 }}>
          {insight.actionable_tip}
        </span>
      </div>
    </motion.div>
  );
}

function TriggerCard({ equation, index }: { equation: TriggerEquation; index: number }) {
  const pct = Math.round(equation.probability * 100);
  const isStrong = equation.probability >= 0.7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      style={{
        background: isStrong ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : 'white',
        borderRadius: '20px',
        padding: '20px',
        border: isStrong ? '2px solid #F59E0B' : '1.5px solid #E5E7EB',
        marginBottom: '12px',
        boxShadow: isStrong ? '0 8px 24px rgba(245, 158, 11, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
      }}
    >
      {/* Factors as equation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        {equation.factors.map((factor, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: isStrong ? '#FFFBEB' : '#F3F4F6',
              border: `1px solid ${isStrong ? '#FCD34D' : '#D1D5DB'}`,
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#1F2937',
            }}>
              {factor}
            </span>
            {i < equation.factors.length - 1 && (
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isStrong ? '#D97706' : '#9CA3AF' }}>+</span>
            )}
          </div>
        ))}
        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: isStrong ? '#D97706' : '#9CA3AF' }}>=</span>
        <span style={{
          background: isStrong ? '#DC2626' : '#7C3AED',
          color: 'white',
          padding: '6px 14px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: 900,
        }}>
          {pct}%
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#4B5563', margin: '0 0 8px 0' }}>
        {equation.description}
      </p>

      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>
        ({equation.events_matching} מתוך {equation.events_total} אירועים)
      </span>
    </motion.div>
  );
}

function SymptomSection({ signature }: { signature: AIAnalysisResponse['symptom_signature'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        border: '1.5px solid #E5E7EB',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        🔔 חתימה סימפטומטית
      </h3>

      {/* Most common symptoms */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {signature.most_common.map((symptom, i) => (
          <span key={i} style={{
            background: i === 0 ? '#FEE2E2' : i === 1 ? '#FEF3C7' : '#E0E7FF',
            color: i === 0 ? '#991B1B' : i === 1 ? '#92400E' : '#3730A3',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}>
            #{i + 1} {symptom}
          </span>
        ))}
      </div>

      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#4B5563', margin: '0 0 12px 0' }}>
        {signature.pre_event_pattern}
      </p>

      {signature.high_intensity_markers.length > 0 && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Zap size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>
            סמנים לעוצמה גבוהה: {signature.high_intensity_markers.join(', ')}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function TimelineSection({ patterns }: { patterns: AIAnalysisResponse['timeline_patterns'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        border: '1.5px solid #E5E7EB',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        📅 דפוסי זמן
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ background: '#EFF6FF', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>שעות שיא</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E40AF' }}>
            {patterns.peak_hours.join(', ')}
          </div>
        </div>
        <div style={{ background: '#F5F3FF', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>ימי שיא</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6D28D9' }}>
            {patterns.peak_days.join(', ')}
          </div>
        </div>
      </div>

      {patterns.cycle_days && (
        <div style={{
          background: '#FFFBEB',
          borderRadius: '12px',
          padding: '10px 12px',
          marginBottom: '12px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#92400E',
        }}>
          🔄 מחזוריות: כל {patterns.cycle_days} ימים
        </div>
      )}

      {patterns.cluster_description && (
        <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#4B5563', margin: 0 }}>
          {patterns.cluster_description}
        </p>
      )}
    </motion.div>
  );
}

function PositiveSection({ findings }: { findings: AIAnalysisResponse['positive_findings'] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{ marginBottom: '24px' }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        ✅ ממצאים חיוביים
      </h3>

      {findings.map((finding, i) => (
        <div key={i} style={{
          background: '#ECFDF5',
          border: '1.5px solid #A7F3D0',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '8px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{finding.emoji}</span>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#065F46', margin: 0, fontWeight: 600 }}>
            {finding.text}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

function DataQualityCard({ quality }: { quality: AIAnalysisResponse['data_quality'] }) {
  const pct = Math.round(quality.completeness * 100);
  const color = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '20px',
        border: '1.5px solid #E5E7EB',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        📊 איכות נתונים
      </h3>

      {/* Completeness bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>שלמות הנתונים</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ height: '100%', background: color, borderRadius: '4px' }}
          />
        </div>
      </div>

      {quality.missing_data_note && (
        <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#6B7280', margin: '0 0 12px 0' }}>
          {quality.missing_data_note}
        </p>
      )}

      {quality.recommendation && (
        <div style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}>
          <Shield size={16} style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.82rem', color: '#1E40AF', lineHeight: 1.5, fontWeight: 600 }}>
            {quality.recommendation}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Loading State
// ═══════════════════════════════════════════

function AnalysisLoading({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      {/* Animated brain icon with pulsing ring */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7F13EC33, #2A19E633)',
            position: 'absolute',
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '4rem', position: 'relative', zIndex: 1 }}
        >
          🧠
        </motion.div>
      </div>

      <div className="spinner" style={{
        width: '44px',
        height: '44px',
        borderTopColor: '#7F13EC',
        marginBottom: '24px',
      }} />

      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#7C3AED',
            marginBottom: '8px',
          }}
        >
          {message}
        </motion.p>
      </AnimatePresence>

      <p style={{ fontSize: '0.85rem', color: '#9CA3AF', fontWeight: 600 }}>
        הניתוח עשוי לקחת 10-30 שניות...
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Empty State / Not Enough Data
// ═══════════════════════════════════════════

function EmptyState({ eventCount }: { eventCount: number }) {
  const needed = ANALYSIS_CONFIG.MIN_EVENTS - eventCount;

  return (
    <div style={{
      padding: '60px 24px',
      textAlign: 'center',
      borderRadius: '24px',
      background: 'rgba(255,255,255,0.6)',
      border: '2px dashed #D1D5DB',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
        עוד קצת סבלנות...
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.6 }}>
        צריך לפחות <strong>{ANALYSIS_CONFIG.MIN_EVENTS} אירועים</strong> כדי לבצע ניתוח AI.
        <br />
        יש לך כרגע <strong>{eventCount}</strong> – חסרים עוד <strong>{needed}</strong>.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════
// Save / Share Utilities
// ═══════════════════════════════════════════

async function generatePDF(element: HTMLElement, title: string): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  // Capture the element as an image
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FAF9F6',
    logging: false,
    windowWidth: 420,
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = (imgHeight * contentWidth) / imgWidth;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let y = margin;
  let remainingHeight = contentHeight;
  let srcY = 0;

  // Multi-page support
  while (remainingHeight > 0) {
    const pageContentHeight = pdfHeight - margin * 2;
    const sliceHeight = Math.min(remainingHeight, pageContentHeight);
    const sliceSrcHeight = (sliceHeight / contentHeight) * imgHeight;

    // Create a slice canvas for this page
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = sliceSrcHeight;
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, srcY, imgWidth, sliceSrcHeight, 0, 0, imgWidth, sliceSrcHeight);
    }
    const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92);

    if (srcY > 0) pdf.addPage();
    pdf.addImage(sliceData, 'JPEG', margin, y, contentWidth, sliceHeight);

    srcY += sliceSrcHeight;
    remainingHeight -= sliceHeight;
  }

  // Add footer to last page
  pdf.setFontSize(8);
  pdf.setTextColor(160, 160, 160);
  pdf.text(`MindTrack – ${title}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });

  return pdf.output('blob');
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1F2937',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '16px',
            fontSize: '0.9rem',
            fontWeight: 700,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            direction: 'rtl',
          }}
        >
          <Check size={18} style={{ color: '#34D399' }} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionBar({
  onSavePDF,
  onShare,
  savingPDF,
}: {
  onSavePDF: () => void;
  onShare: () => void;
  savingPDF: boolean;
}) {
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 50,
        direction: 'rtl',
      }}
    >
      {/* Save as PDF */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onSavePDF}
        disabled={savingPDF}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 24px',
          borderRadius: '20px',
          border: 'none',
          background: 'white',
          color: '#7C3AED',
          fontWeight: 800,
          fontSize: '0.9rem',
          cursor: savingPDF ? 'wait' : 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          opacity: savingPDF ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {savingPDF ? <Loader2 size={18} className="spin" /> : <Download size={18} />}
        {savingPDF ? 'יוצר PDF...' : 'שמור PDF'}
      </motion.button>

      {/* Share */}
      {canShare && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            borderRadius: '20px',
            border: 'none',
            background: 'linear-gradient(135deg, #7F13EC, #2A19E6)',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(127, 19, 236, 0.3)',
          }}
        >
          <Share2 size={18} />
          שתף
        </motion.button>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const {
    analysis,
    loading,
    loadingPrevious,
    error,
    progressMessage,
    lastAnalyzedAt,
    runAnalysis,
    hasEnoughData,
    eventCount,
  } = useAnalysis(user?.id, profile?.primary_condition || null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const [savingPDF, setSavingPDF] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleSavePDF = useCallback(async () => {
    if (!resultsRef.current || !analysis) return;
    setSavingPDF(true);
    try {
      const dateStr = analysis.analysis_summary?.date_range || new Date().toLocaleDateString('he-IL');
      const fileName = `MindTrack-ניתוח-${dateStr.replace(/\s/g, '-')}.pdf`;
      const blob = await generatePDF(resultsRef.current, dateStr);

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('הניתוח נשמר כ-PDF ✓');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('שגיאה ביצירת PDF');
    } finally {
      setSavingPDF(false);
    }
  }, [analysis, showToast]);

  const handleShare = useCallback(async () => {
    if (!analysis) return;
    try {
      // Build a text summary for sharing
      const summary = analysis.analysis_summary;
      const insights = (analysis.key_insights || []).slice(0, 3);
      let text = `📊 ניתוח MindTrack AI\n`;
      text += `${summary?.date_range || ''} | ${summary?.total_events_analyzed || 0} אירועים\n\n`;
      insights.forEach((ins, i) => {
        text += `${ins.emoji} ${ins.title}\n`;
        if (i < insights.length - 1) text += '\n';
      });
      text += `\n\n⚕️ ${analysis.medical_disclaimer || ''}`;

      if (navigator.share) {
        // Try sharing as PDF if possible
        if (resultsRef.current) {
          try {
            const blob = await generatePDF(resultsRef.current, summary?.date_range || '');
            const file = new File([blob], 'MindTrack-Analysis.pdf', { type: 'application/pdf' });
            await navigator.share({ title: 'ניתוח MindTrack AI', text, files: [file] });
            showToast('שותף בהצלחה ✓');
            return;
          } catch {
            // Fallback to text-only share if file sharing not supported
          }
        }
        await navigator.share({ title: 'ניתוח MindTrack AI', text });
        showToast('שותף בהצלחה ✓');
      }
    } catch (err) {
      // User cancelled share – not an error
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    }
  }, [analysis, showToast]);

  // Page loading state
  if (loadingPrevious) {
    return (
      <div className="page" style={{ background: 'var(--bg-warm)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#7C3AED' }} />
          <p style={{ marginTop: '16px', color: '#6B7280', fontWeight: 700 }}>טוען ניתוח קודם...</p>
        </div>
      </div>
    );
  }

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
        <h1 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>ניתוח AI מעמיק</h1>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '1.3rem' }}>🧠</span>
        </div>
      </div>

      {/* Subtitle */}
      <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
        ניתוח דפוסים מתקדם על בסיס 7 ממדים בריאותיים
      </p>

      {/* Generate Button */}
      {hasEnoughData && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={runAnalysis}
          disabled={loading}
          style={{
            marginBottom: '8px',
            padding: '20px',
            fontSize: '1.15rem',
            borderRadius: '20px',
            background: loading
              ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
              : 'linear-gradient(135deg, #7F13EC, #2A19E6)',
            color: 'white',
            boxShadow: loading ? 'none' : '0 12px 32px rgba(127, 19, 236, 0.3)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={22} />
          {loading ? 'מנתח...' : analysis ? 'הפעל ניתוח מחדש' : 'הפעל ניתוח AI'}
        </motion.button>
      )}

      {/* Last analyzed info */}
      {lastAnalyzedAt && !loading && (
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '24px', fontWeight: 600 }}>
          ניתוח אחרון: {getRelativeTime(lastAnalyzedAt)}
        </p>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={20} style={{ color: '#DC2626', flexShrink: 0 }} />
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#991B1B', fontWeight: 700 }}>שגיאה בניתוח</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#B91C1C' }}>{error}</p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && <AnalysisLoading message={progressMessage} />}

      {/* Not enough data */}
      {!loading && !hasEnoughData && <EmptyState eventCount={eventCount} />}

      {/* Results */}
      {!loading && analysis && (
        <div ref={resultsRef}>
          {/* Summary */}
          <SummaryCard summary={analysis.analysis_summary} />

          {/* Key Insights */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 תובנות מרכזיות
              <span style={{
                background: '#F3F4F6',
                color: '#6B7280',
                padding: '2px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {(analysis.key_insights || []).length}
              </span>
            </h2>
            {(analysis.key_insights || []).map((insight, i) => (
              <InsightCard key={insight.id ?? i} insight={insight} index={i} />
            ))}
          </div>

          {/* Trigger Equations */}
          {(analysis.trigger_equations || []).length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚡ משוואות טריגר
              </h2>
              {(analysis.trigger_equations || []).map((eq, i) => (
                <TriggerCard key={i} equation={eq} index={i} />
              ))}
            </div>
          )}

          {/* Symptom Signature */}
          {analysis.symptom_signature?.most_common?.length > 0 && (
            <SymptomSection signature={analysis.symptom_signature} />
          )}

          {/* Timeline Patterns */}
          {analysis.timeline_patterns && (
            <TimelineSection patterns={analysis.timeline_patterns} />
          )}

          {/* Positive Findings */}
          {(analysis.positive_findings || []).length > 0 && (
            <PositiveSection findings={analysis.positive_findings} />
          )}

          {/* Data Quality */}
          {analysis.data_quality && (
            <DataQualityCard quality={analysis.data_quality} />
          )}

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              background: '#F9FAFB',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <p style={{
              fontSize: '0.78rem',
              color: '#9CA3AF',
              lineHeight: 1.6,
              margin: 0,
            }}>
              ⚕️ {analysis.medical_disclaimer}
            </p>
          </motion.div>

          {/* Extra spacing for floating action bar */}
          <div style={{ height: '60px' }} />
        </div>
      )}

      {/* Floating Action Bar – save/share */}
      {!loading && analysis && (
        <ActionBar onSavePDF={handleSavePDF} onShare={handleShare} savingPDF={savingPDF} />
      )}

      {/* Toast notification */}
      <Toast message={toast || ''} visible={!!toast} />
    </div>
  );
}
