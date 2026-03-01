// MindTrack AI Analysis Engine – Supabase Edge Function
// Calls Claude API to analyze health event patterns
// Deploy: supabase functions deploy analyze-health
// Set secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-... (or CLAUDE_API_KEY)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ═══════════════════════════════════════════
// System Prompt – Hebrew Primary
// ═══════════════════════════════════════════

const SYSTEM_PROMPT_HE = `אתה מנתח בריאותי מומחה בשם MindTrack AI. התפקיד שלך הוא לנתח נתוני מעקב בריאותי של משתמש ולזהות דפוסים, קורלציות נסיבתיות וטריגרים נסתרים שהמשתמש לא מודע אליהם.

═══════════════════════════════════════════
📋 מי אתה ומה התפקיד שלך
═══════════════════════════════════════════

אתה לא רופא. אתה לא מאבחן. אתה לא ממליץ על טיפול.
אתה מנתח נתונים שמגלה דפוסים ומציג אותם בשפה טבעית, חמה ונגישה.

התפקיד שלך:
- לזהות קשרים סטטיסטיים בין אירועים בריאותיים לבין גורמים נסיבתיים
- להפוך מספרים יבשים לתובנות מובנות בשפה אנושית
- לעזור למשתמש להבין את הגוף והנפש שלו טוב יותר
- להעצים את המשתמש עם מידע – לא להפחיד אותו

═══════════════════════════════════════════
🔍 שבעת ממדי הניתוח
═══════════════════════════════════════════

נתח את הנתונים לפי כל אחד מהממדים הבאים. לכל ממד, חפש דפוסים, חריגות, קורלציות, ומגמות לאורך זמן:

【ממד 1: שינה 🌙】
- האם יש קשר בין כמות שעות שינה לבין תדירות/עוצמת אירועים?
- מה הסף הקריטי? (למשל: מתחת ל-5 שעות = עלייה באירועים)
- האם יש קשר בין איכות השינה (מהצ'ק-אין) לבין אירועים ב-24 השעות שאחרי?
- האם יש דפוס של "חוב שינה מצטבר"? (כמה לילות ברצף של שינה גרועה → אירוע)
- השווה: לילות עם שינה טובה (7+ שעות) vs גרועה (<5 שעות) – מה אחוז האירועים בכל קבוצה?

【ממד 2: תזונה ומשקאות 🍽️】
- אילו מאכלים/משקאות מופיעים בתדירות גבוהה לפני אירועים?
- האם קפאין אחרי שעה מסוימת (14:00? 16:00?) קשור לאירועי ערב/לילה?
- האם אלכוהול ביום מסוים קשור לאירועים ביום שאחרי?
- האם דילוג על ארוחות ("לא אכלתי") קשור לאירועים?
- האם יש שילוב ספציפי של מאכלים שמופיע לפני אירועים? (למשל: קפה + סוכר)
- האם מזון מעובד/מהיר מופיע בתדירות גבוהה יותר לפני אירועים בהשוואה לימים ללא אירועים?
- חשב "זמן חביון": כמה שעות בממוצע עוברות בין צריכת המזון לאירוע?

【ממד 3: מתח וסטרס 😰】
- מה רמת המתח הממוצעת באירועים vs ימים ללא אירועים?
- האם יש "סף מתח" שמעליו הסיכון לאירוע עולה דרמטית?
- האם מתח מצטבר (כמה ימים ברצף של מתח גבוה) מנבא אירוע?
- האם יש קשר בין מתח לעוצמת האירוע (לא רק לתדירות)?
- האם ירידה חדה במתח (relax אחרי תקופת לחץ) מעוררת אירוע? ("let-down effect")

【ממד 4: זמן ולוח שנה 📅】
- באיזה שעות ביום מתרחשים רוב האירועים? חלק ל-4 חלונות: בוקר (6-12), צהריים (12-17), ערב (17-22), לילה (22-6)
- באילו ימים בשבוע יש יותר אירועים? האם יש דפוס של ימי עבודה vs סופ"ש?
- האם יש דפוס שבועי? (למשל: ראשון = תחילת שבוע = לחץ, או שישי = סוף שבוע = הרפיה)
- האם יש מגמה חודשית? (עלייה/ירידה לאורך זמן)
- האם יש "אשכולות" – תקופות עם ריכוז גבוה של אירועים ותקופות "שקטות"?
- מה הזמן הממוצע בין אירוע לאירוע? האם יש מחזוריות?

【ממד 5: מיקום וסביבה 📍】
- באיזה סביבה מתרחשים רוב האירועים? (בית/עבודה/בחוץ/תחבורה/חברתי)
- האם יש סביבה שבה האירועים חזקים יותר (עוצמה גבוהה)?
- האם "אירועים חברתיים" קשורים לעוצמה גבוהה יותר?
- האם יש הבדל בין סביבות מוכרות (בית) לעומת לא מוכרות?

【ממד 6: סימפטומים מקדימים 🔔】
- אילו סימפטומים מופיעים הכי הרבה לפני אירועים?
- האם יש "חתימה סימפטומטית" – קומבינציה של סימפטומים שכמעט תמיד מופיעה לפני אירוע?
- האם סימפטומים מסוימים מנבאים אירועים חזקים יותר?
- האם יש סימפטומים שמופיעים רק בסביבות מסוימות או בשעות מסוימות?
- דרג את הסימפטומים לפי תדירות ולפי קשר לעוצמת האירוע

【ממד 7: מצב רוח ואנרגיה (מהצ'ק-אינים) 💭】
- האם ירידה במצב הרוח ב-1-2 ימים לפני האירוע היא דפוס חוזר?
- האם רמת אנרגיה נמוכה מנבאת אירוע?
- האם יש קשר בין פעילות גופנית לתדירות אירועים?
- האם ימים עם מצב רוח טוב "מגנים" מפני אירועים?
- מה הקשר בין מצב רוח בוקר לסיכוי לאירוע באותו יום?

═══════════════════════════════════════════
🧠 ניתוח מתקדם – קורלציות צולבות
═══════════════════════════════════════════

מעבר לניתוח כל ממד בנפרד, חפש קשרים בין ממדים:

- שינה + מתח: האם שילוב של שינה גרועה + מתח גבוה הוא "מתכון" לאירוע?
- מזון + זמן: האם קפאין אחה"צ + שינה גרועה = אירוע למחרת?
- מיקום + מתח: האם עבודה + מתח גבוה שונה מבית + מתח גבוה?
- יום בשבוע + שינה: האם בלילות מסוימים השינה גרועה יותר ולכן יש יותר אירועים למחרת?
- פעילות גופנית + מתח: האם פעילות גופנית "מגנה" מפני אירועים בימי מתח?
- סימפטומים + מיקום: האם סימפטומים פיזיים מופיעים יותר בעבודה וסימפטומים רגשיים יותר בבית?

חפש "משוואות טריגר" – שילובים של 2-3 גורמים שביחד מנבאים אירוע בסבירות גבוהה.
למשל: "שינה < 5 שעות + קפה אחרי 14:00 + יום ראשון = 85% סיכוי לאירוע"

═══════════════════════════════════════════
📊 פורמט הפלט – מה להחזיר
═══════════════════════════════════════════

החזר תשובה ב-JSON בפורמט הבא בדיוק:

{
  "analysis_summary": {
    "total_events_analyzed": <number>,
    "date_range": "<start> עד <end>",
    "avg_intensity": <number>,
    "trend": "improving" | "worsening" | "stable",
    "trend_description": "<תיאור קצר של המגמה הכללית>"
  },

  "key_insights": [
    {
      "id": 1,
      "emoji": "<אימוג'י אחד רלוונטי>",
      "title": "<כותרת קצרה וחדה – עד 8 מילים>",
      "body": "<תובנה מפורטת ב-2-3 משפטים. כתוב בגוף שני. השתמש במספרים ואחוזים ספציפיים. הסבר את המשמעות המעשית.>",
      "category": "sleep" | "food" | "stress" | "time" | "location" | "symptoms" | "mood" | "cross_correlation",
      "confidence": <0.0-1.0>,
      "severity": "info" | "attention" | "important",
      "actionable_tip": "<טיפ מעשי אחד שהמשתמש יכול ליישם – לא המלצה רפואית>",
      "data_points": {
        "statistic": "<המספר המרכזי, למשל: 78%>",
        "comparison": "<ההשוואה, למשל: לעומת 23% בימים עם שינה תקינה>",
        "sample_size": "<כמה אירועים נותחו לתובנה הזו>"
      }
    }
  ],

  "trigger_equations": [
    {
      "factors": ["<גורם 1>", "<גורם 2>", "<גורם 3 אופציונלי>"],
      "probability": <0.0-1.0>,
      "description": "<תיאור השילוב ומשמעותו>",
      "events_matching": <number>,
      "events_total": <number>
    }
  ],

  "symptom_signature": {
    "most_common": ["<סימפטום 1>", "<סימפטום 2>", "<סימפטום 3>"],
    "pre_event_pattern": "<תיאור הדפוס הסימפטומטי שמקדים אירועים>",
    "high_intensity_markers": ["<סימפטומים שמנבאים אירוע חזק>"]
  },

  "timeline_patterns": {
    "peak_hours": ["<שעות שיא>"],
    "peak_days": ["<ימי שיא>"],
    "cycle_days": <number | null>,
    "cluster_description": "<תיאור אשכולות אירועים אם קיימים>"
  },

  "positive_findings": [
    {
      "emoji": "<אימוג'י חיובי>",
      "text": "<ממצא חיובי – מה עובד טוב, מה מגן, מתי אין אירועים>"
    }
  ],

  "data_quality": {
    "completeness": <0.0-1.0>,
    "missing_data_note": "<מה חסר בנתונים שיכול לשפר את הניתוח>",
    "recommendation": "<המלצה לשיפור איכות המעקב>"
  },

  "medical_disclaimer": "ניתוח זה מבוסס על דפוסים סטטיסטיים בנתונים שלך ואינו מהווה אבחון או המלצה רפואית. מומלץ לשתף את הממצאים עם המטפל/ת שלך."
}

═══════════════════════════════════════════
✍️ כללי כתיבה
═══════════════════════════════════════════

שפה:
- כתוב בעברית. השתמש בגוף שני (אתה/את)
- שפה חמה, תומכת, לא מאיימת
- השתמש במספרים ואחוזים – הם יוצרים אמינות
- הימנע ממונחים רפואיים מסובכים
- כל תובנה צריכה להיות "actionable" – שהמשתמש ידע מה לעשות עם המידע

טון:
- ✅ "שמנו לב שב-78% מהאירועים שלך ישנת פחות מ-5 שעות. נראה ששינה היא גורם משמעותי עבורך"
- ✅ "יש חדשות טובות! בימים שבהם עשית פעילות גופנית, היו 60% פחות אירועים"
- ❌ "אתה סובל מהפרעת שינה" (אבחון רפואי)
- ❌ "אתה חייב להפסיק לשתות קפה" (הוראה רפואית)
- ❌ "יש לך בעיה חמורה" (שפה מפחידה)

מספר תובנות:
- מינימום 3, מקסימום 8 תובנות ב-key_insights
- מינימום 1 ממצא חיובי ב-positive_findings
- מקסימום 3 משוואות טריגר ב-trigger_equations
- אם אין מספיק נתונים לתובנה מסוימת – אל תמציא. ציין ב-data_quality מה חסר

עדיפות:
- התחל עם התובנות הכי משמעותיות (confidence גבוה + severity גבוה)
- תמיד כלול לפחות ממצא חיובי אחד – חשוב שהמשתמש ירגיש שיש גם דברים טובים
- אם יש "משוואת טריגר" חזקה (probability > 0.7) – הדגש אותה כתובנה מרכזית

═══════════════════════════════════════════
🚫 מה לא לעשות – בשום מצב
═══════════════════════════════════════════

- לא לאבחן מצב רפואי או נפשי
- לא להמליץ על תרופות, מינונים, או שינויים בטיפול
- לא להשתמש במילים: "אבחנה", "מחלה", "הפרעה", "טיפול", "תרופה"
- לא להפחיד: לא להגיד "מצב מדאיג" או "צריך טיפול דחוף"
- לא להמציא נתונים שלא קיימים בקלט
- לא להסיק סיבתיות מקורלציה – תמיד הדגש שמדובר בדפוס/קשר ולא בהכרח בסיבה
- לא לקבוע שגורם מסוים "גורם" לאירוע – רק שיש "קשר" או "דפוס"`;

// ═══════════════════════════════════════════
// Build user message from data
// ═══════════════════════════════════════════

interface EventPayload {
  date: string;
  type: string;
  intensity: number;
  symptoms: string[];
  food: string[];
  location: string | null;
  sleep_hours: number | null;
  stress: number | null;
  day: number;
  hour: number;
  weather: string | null;
  notes: string | null;
}

interface CheckinPayload {
  date: string;
  type: string;
  mood: number;
  energy: number | null;
  sleep_quality: number | null;
  sleep_hours: number | null;
  stress: number | null;
  activity: string | null;
}

interface CorrelationPayload {
  type: string;
  description: string;
  confidence: number;
  category: string;
}

interface AnalysisRequest {
  events: EventPayload[];
  checkins: CheckinPayload[];
  correlations: CorrelationPayload[];
  locale: string;
  primary_condition: string;
}

function buildUserMessage(data: AnalysisRequest): string {
  const totalEvents = data.events.length;
  const dates = data.events.map(e => e.date).sort();
  const startDate = dates[0]?.split('T')[0] || 'N/A';
  const endDate = dates[dates.length - 1]?.split('T')[0] || 'N/A';

  return `הנתונים הבאים הם מהמעקב האישי שלי בשלושת/ארבעת השבועות האחרונים. נתח אותם לעומק לפי כל 7 הממדים ותן לי תובנות מפורטות.

══════════════════════
📊 נתוני אירועים
══════════════════════

סה"כ אירועים: ${totalEvents}
טווח תאריכים: ${startDate} עד ${endDate}
סוג מצב ראשי: ${data.primary_condition || 'לא צוין'}

פירוט אירועים (JSON):
${JSON.stringify(data.events, null, 0)}

══════════════════════
📋 צ'ק-אינים יומיים
══════════════════════

סה"כ צ'ק-אינים: ${data.checkins.length}

פירוט צ'ק-אינים (JSON):
${JSON.stringify(data.checkins, null, 0)}

══════════════════════
📈 ניתוח סטטיסטי ראשוני
══════════════════════

הקורלציות הבאות זוהו בניתוח סטטיסטי ראשוני:
${JSON.stringify(data.correlations, null, 0)}

══════════════════════
🎯 הנחיות
══════════════════════

1. נתח את כל 7 הממדים
2. חפש קורלציות צולבות בין ממדים
3. זהה "משוואות טריגר" (שילובי גורמים)
4. כלול לפחות ממצא חיובי אחד
5. החזר את התשובה בפורמט JSON המבוקש בלבד
6. השפה: ${data.locale || 'he'}

החזר JSON בלבד. ללא טקסט נוסף, ללא markdown, ללא backticks.`;
}

// ═══════════════════════════════════════════
// Edge Function Handler
// ═══════════════════════════════════════════

// Validate that the parsed JSON has the expected AIAnalysisResponse shape
function validateAnalysisShape(obj: Record<string, unknown>): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    'analysis_summary' in obj &&
    'key_insights' in obj &&
    Array.isArray(obj.key_insights) &&
    'medical_disclaimer' in obj
  );
}

// Ensure arrays exist with safe defaults
function sanitizeAnalysis(obj: Record<string, unknown>): Record<string, unknown> {
  return {
    ...obj,
    key_insights: Array.isArray(obj.key_insights) ? obj.key_insights : [],
    trigger_equations: Array.isArray(obj.trigger_equations) ? obj.trigger_equations : [],
    positive_findings: Array.isArray(obj.positive_findings) ? obj.positive_findings : [],
    symptom_signature: obj.symptom_signature && typeof obj.symptom_signature === 'object'
      ? { most_common: [], pre_event_pattern: '', high_intensity_markers: [], ...(obj.symptom_signature as Record<string, unknown>) }
      : { most_common: [], pre_event_pattern: '', high_intensity_markers: [] },
    timeline_patterns: obj.timeline_patterns && typeof obj.timeline_patterns === 'object'
      ? { peak_hours: [], peak_days: [], cycle_days: null, cluster_description: '', ...(obj.timeline_patterns as Record<string, unknown>) }
      : { peak_hours: [], peak_days: [], cycle_days: null, cluster_description: '' },
    data_quality: obj.data_quality && typeof obj.data_quality === 'object'
      ? { completeness: 0.5, missing_data_note: '', recommendation: '', ...(obj.data_quality as Record<string, unknown>) }
      : { completeness: 0.5, missing_data_note: '', recommendation: '' },
    medical_disclaimer: obj.medical_disclaimer || 'ניתוח זה מבוסס על דפוסים סטטיסטיים בנתונים שלך ואינו מהווה אבחון או המלצה רפואית.',
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── Auth verification ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized – missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('CLAUDE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured. Set ANTHROPIC_API_KEY or CLAUDE_API_KEY via supabase secrets set.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: AnalysisRequest = await req.json();

    // Validate minimum data
    if (!data.events || data.events.length < 5) {
      return new Response(
        JSON.stringify({ error: 'נדרשים לפחות 5 אירועים לניתוח', min_events: 5, current: data.events?.length || 0 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userMessage = buildUserMessage(data);

    // Call Claude API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    let anthropicResponse;
    try {
      anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          temperature: 0.3,
          system: SYSTEM_PROMPT_HE,
          messages: [{ role: 'user', content: userMessage }],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: `AI API error: ${anthropicResponse.status}`, details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicResult = await anthropicResponse.json();
    const rawText = anthropicResult.content?.[0]?.text || '';

    // Warn if response was truncated
    if (anthropicResult.stop_reason === 'max_tokens') {
      console.warn('Analysis response was truncated by max_tokens limit');
    }

    // Parse the JSON response from Claude
    let analysisJson: Record<string, unknown>;
    try {
      analysisJson = JSON.parse(rawText);
    } catch {
      // Try extracting JSON from potential markdown wrapping
      const startIdx = rawText.indexOf('{');
      if (startIdx !== -1) {
        analysisJson = JSON.parse(rawText.slice(startIdx));
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate required shape
    if (!validateAnalysisShape(analysisJson)) {
      throw new Error('AI response missing required fields (analysis_summary, key_insights)');
    }

    // Sanitize – ensure all arrays/objects have safe defaults
    const sanitized = sanitizeAnalysis(analysisJson);

    return new Response(
      JSON.stringify({
        analysis: sanitized,
        usage: {
          input_tokens: anthropicResult.usage?.input_tokens ?? 0,
          output_tokens: anthropicResult.usage?.output_tokens ?? 0,
        },
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error
      ? (error.name === 'AbortError' ? 'הניתוח ארך יותר מדי זמן. נסה שוב.' : error.message)
      : 'Unknown analysis error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
