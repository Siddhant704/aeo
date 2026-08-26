import { useState, useEffect, useRef } from "react";
import {
  Camera, MessageCircle, Dumbbell, Users, Activity, Home, Send,
  Plus, Check, X, ChevronRight, Droplet, Moon, Flame, Loader2,
  Upload, Footprints, Weight, Star, Clock, Sparkles, ArrowRight,
  Play, Pause, Square, Mountain, Heart, Target, Trophy, Gauge, Minus,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ComposedChart, Area,
} from "recharts";
import { AnimatePresence, motion } from "framer-motion";
import {
  CountUp, GLIDE, LIFT, Reveal, SETTLE, Stagger, StaggerItem,
  TableLight, Thali3D, Tilt, useCalm,
} from "./src/motion.jsx";

/* ---------- storage helpers ---------- */
async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, false);
    return res ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("storage save failed", e);
  }
}

/* ---------- thali wedge geometry ---------- */
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function wedgePath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

const MODULES = [
  { id: "snap", label: "Track", sub: "AI meal snap", icon: Camera, fill: "#1F3D2B" },
  { id: "coach", label: "Coach", sub: "AI chat", icon: MessageCircle, fill: "#B8791E" },
  { id: "workouts", label: "Move", sub: "Classes & video", icon: Dumbbell, fill: "#9C3E14" },
  { id: "coaches", label: "Consult", sub: "Book an expert", icon: Users, fill: "#2E5940" },
  { id: "vitals", label: "Vitals", sub: "Body data", icon: Activity, fill: "#C1571F" },
];

function ThaliMark({ size = 40 }) {
  const r = 18, cx = 20, cy = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r + 2} fill="#FBF7EE" stroke="#E7DFCC" strokeWidth="1" />
      {MODULES.map((m, i) => (
        <path key={m.id} d={wedgePath(cx, cy, r, i * 72, i * 72 + 72)} fill={m.fill} opacity="0.92" />
      ))}
      <circle cx={cx} cy={cy} r={5.5} fill="#FBF7EE" />
    </svg>
  );
}

/* ---------- progress ring ---------- */
function ProgressRing({ value, max, color = "#1F3D2B", size = 120, label }) {
  const calm = useCalm();
  const r = size / 2 - 10, c = 2 * Math.PI * r;
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE7D8" strokeWidth="10" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: calm ? c * (1 - pct) : c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: calm ? 0 : 1.3, ease: [0.16, 1, 0.3, 1] }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="46%" textAnchor="middle" fontSize="20" fontWeight="700" fill="#211D18" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {Math.round(value)}
      </text>
      <text x="50%" y="60%" textAnchor="middle" fontSize="10" fill="#7A6F58" style={{ fontFamily: "Inter, sans-serif" }}>
        {label}
      </text>
    </svg>
  );
}

/* ---------- fonts ---------- */
function Fonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
      .font-display { font-family: 'Fraunces', serif; }
      .font-body { font-family: 'Inter', sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
    `}</style>
  );
}

/* ================= LANDING PAGE ================= */
const FEATURES = [
  { icon: Camera, title: "AI meal snap", desc: "Photograph your plate. AI identifies every item and estimates calories and macros instantly, no manual search.", tag: "Inspired by HealthifySnap" },
  { icon: MessageCircle, title: "AI coach chat", desc: "Ask anything, anytime — nutrition swaps, workout tweaks, motivation. A conversational coach that knows your history.", tag: "Inspired by Ria" },
  { icon: Dumbbell, title: "Classes & video library", desc: "Book live group classes or stream on-demand strength, yoga and dance workouts whenever you want.", tag: "Inspired by cult.fit" },
  { icon: Users, title: "Coach marketplace", desc: "Browse certified dietitians and trainers, book a real 1:1 consultation, and get a fully custom plan.", tag: "Inspired by Fitelo & Fittr" },
  { icon: Activity, title: "Vitals dashboard", desc: "Log weight, sleep and steps, or sync a wearable. Watch trends over time with a body 'digital twin.'", tag: "Inspired by Fittr's Sense & HART" },
  { icon: Sparkles, title: "One unified profile", desc: "Every meal, workout, booking and lab result lives in a single timeline — not five disconnected apps.", tag: "Our own take" },
];

const PROOF = [
  { value: 400, suffix: "k+", label: "transformations across the category" },
  { value: 1200, suffix: "+", label: "on-demand workout formats" },
  { value: 100, suffix: "+", label: "lab biomarkers trackable" },
  { value: 1, suffix: "", label: "app to remember" },
];

function Landing({ onEnter }) {
  const calm = useCalm();
  return (
    <div className="font-body bg-orange-50 min-h-screen text-stone-900 overflow-x-hidden">
      <Fonts />

      <motion.header
        className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6"
        initial={calm ? { opacity: 0 } : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SETTLE, delay: 0.05 }}
      >
        <div className="flex items-center gap-2">
          <ThaliMark size={34} />
          <span className="font-display text-lg font-semibold tracking-tight">Thali</span>
        </div>
        <motion.button
          onClick={() => onEnter()}
          whileHover={calm ? undefined : { y: -2 }}
          whileTap={calm ? undefined : { y: 0, scale: 0.97 }}
          transition={LIFT}
          className="bg-emerald-900 text-orange-50 px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors surface"
        >
          Enter the app
        </motion.button>
      </motion.header>

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-10 pb-28 grid md:grid-cols-2 gap-12 items-center">
        <TableLight />
        <div className="relative">
          <motion.p
            className="uppercase tracking-widest text-xs text-orange-700 font-semibold mb-4"
            initial={calm ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SETTLE, delay: 0.12 }}
          >
            Every wellness app, one plate
          </motion.p>
          <motion.h1
            className="font-display text-5xl md:text-6xl leading-[1.05] font-semibold text-stone-900 mb-6"
            initial={calm ? { opacity: 0 } : { opacity: 0, y: 24, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ ...SETTLE, delay: 0.2 }}
            style={{ transformPerspective: 1000 }}
          >
            Stop juggling five apps for one body.
          </motion.h1>
          <motion.p
            className="text-stone-600 text-lg mb-8 max-w-md"
            initial={calm ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SETTLE, delay: 0.3 }}
          >
            Snap your meals, chat with an AI coach, book a class, consult a
            dietitian, and track your vitals — all from a single plate.
            Everything HealthifyMe, Fittr, cult.fit and a personal dietitian
            do separately, done together.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={calm ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SETTLE, delay: 0.38 }}
          >
            <motion.button
              onClick={() => onEnter()}
              whileHover={calm ? undefined : { y: -3 }}
              whileTap={calm ? undefined : { y: 0, scale: 0.97 }}
              transition={LIFT}
              className="bg-emerald-900 text-orange-50 px-6 py-3 rounded-full font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 surface"
            >
              Start free <ArrowRight size={16} />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              whileHover={calm ? undefined : { y: -3 }}
              whileTap={calm ? undefined : { y: 0, scale: 0.97 }}
              transition={LIFT}
              className="border border-stone-300 px-6 py-3 rounded-full font-medium hover:bg-white transition-colors"
            >
              See what's on the plate
            </motion.button>
          </motion.div>
        </div>

        {/* THE SIGNATURE */}
        <div className="relative">
          <Thali3D modules={MODULES} onPick={onEnter} />
          <motion.p
            className="mt-6 text-center text-xs text-stone-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            {calm ? "Pick a wedge to begin" : "Lean over the plate — pick a wedge to begin"}
          </motion.p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-stone-200">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold mb-2">Five servings, one meal</h2>
          <p className="text-stone-600 mb-12 max-w-xl">
            Each wedge of the plate is a full feature set on its own — pulled
            from what people actually reach for across the top wellness apps.
          </p>
        </Reveal>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <Tilt className="h-full bg-white rounded-2xl p-6 border border-stone-200 hover:border-orange-300 transition-colors surface hover:surface-raised">
                <f.icon size={22} className="text-orange-700 mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-stone-600 text-sm mb-3">{f.desc}</p>
                <p className="text-xs text-emerald-800 font-medium">{f.tag}</p>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* WHY */}
      <section className="bg-emerald-900 text-orange-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold mb-4">Why one plate beats five apps</h2>
            <p className="text-orange-100/80 mb-6">
              Health apps in India have specialized: one for AI tracking, one
              for coaches and wearables, one for gym classes, one for
              boutique dietitian calls. Splitting your data across all of
              them means none of them sees the full picture. We put every
              wedge on one plate so your coach can see your workouts, your
              trainer can see your meals, and you only have one streak to
              keep.
            </p>
            <motion.button
              onClick={() => onEnter()}
              whileHover={calm ? undefined : { y: -3 }}
              whileTap={calm ? undefined : { y: 0, scale: 0.97 }}
              transition={LIFT}
              className="bg-orange-50 text-emerald-900 px-6 py-3 rounded-full font-medium hover:bg-white transition-colors"
            >
              Build your plate
            </motion.button>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4" step={0.08}>
            {PROOF.map((p) => (
              <StaggerItem key={p.label}>
                <Tilt className="h-full bg-emerald-800/60 rounded-2xl p-5" max={8}>
                  <p className="font-display text-3xl font-semibold text-amber-400">
                    <CountUp to={p.value} />{p.suffix}
                  </p>
                  <p className="text-sm text-orange-100/80 mt-1">{p.label}</p>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-stone-500 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ThaliMark size={22} />
          <span>Thali</span>
        </div>
        <span>A concept build — not affiliated with HealthifyMe, Fittr, cult.fit or Fitelo.</span>
      </footer>
    </div>
  );
}

/* ================= APP SHELL ================= */
const TABS = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "snap", label: "Snap", icon: Camera },
  { id: "coach", label: "Coach", icon: MessageCircle },
  { id: "workouts", label: "Move", icon: Dumbbell },
  { id: "treadmill", label: "Tread", icon: Footprints },
  { id: "coaches", label: "Consult", icon: Users },
  { id: "vitals", label: "Vitals", icon: Activity },
];

export default function App() {
  const calm = useCalm();
  const [page, setPage] = useState("landing");
  const [tab, setTab] = useState("dashboard");

  const [profile, setProfile] = useState({ name: "You", calorieGoal: 2000 });
  const [meals, setMeals] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [dailyStats, setDailyStats] = useState({ water: 4, steps: 5200, sleep: 6.5, date: new Date().toDateString() });
  const [weightLog, setWeightLog] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, m, msg, b, c, ds, w, r] = await Promise.all([
        loadKey("profile", { name: "You", calorieGoal: 2000 }),
        loadKey("meals", []),
        loadKey("coach_messages", []),
        loadKey("bookings", []),
        loadKey("consultations", []),
        loadKey("daily_stats", { water: 4, steps: 5200, sleep: 6.5, date: new Date().toDateString() }),
        loadKey("weight_log", [
          { date: "Mon", weight: 74.2 }, { date: "Tue", weight: 74.0 }, { date: "Wed", weight: 73.8 },
          { date: "Thu", weight: 73.9 }, { date: "Fri", weight: 73.5 }, { date: "Sat", weight: 73.3 }, { date: "Sun", weight: 73.1 },
        ]),
        loadKey("treadmill_runs", []),
      ]);
      setProfile(p); setMeals(m); setMessages(msg); setBookings(b); setConsultations(c); setDailyStats(ds); setWeightLog(w); setRuns(r);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveKey("meals", meals); }, [meals, loaded]);
  useEffect(() => { if (loaded) saveKey("coach_messages", messages); }, [messages, loaded]);
  useEffect(() => { if (loaded) saveKey("bookings", bookings); }, [bookings, loaded]);
  useEffect(() => { if (loaded) saveKey("consultations", consultations); }, [consultations, loaded]);
  useEffect(() => { if (loaded) saveKey("daily_stats", dailyStats); }, [dailyStats, loaded]);
  useEffect(() => { if (loaded) saveKey("weight_log", weightLog); }, [weightLog, loaded]);
  useEffect(() => { if (loaded) saveKey("treadmill_runs", runs); }, [runs, loaded]);

  const enter = (moduleId) => {
    setPage("app");
    setTab(TABS.some((t) => t.id === moduleId) ? moduleId : "dashboard");
  };

  const todayCalories = meals
    .filter((m) => m.date === new Date().toDateString())
    .reduce((sum, m) => sum + (m.totalCalories || 0), 0);

  /* Both pages sit inside one AnimatePresence. An AnimatePresence placed
     inside the branch it unmounts is torn down with that branch and never
     gets to play its exit, so the landing page would just vanish. */
  return (
    <AnimatePresence mode="wait">
      {page === "landing" ? (
        <motion.div
          key="landing"
          exit={calm ? { opacity: 0 } : { opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={GLIDE}
        >
          <Landing onEnter={enter} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          className="font-body bg-orange-50 min-h-screen text-stone-900 pb-20 md:pb-0 overflow-x-hidden"
          initial={calm ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SETTLE}
        >
          <Fonts />
          <div className="flex">
        {/* sidebar (desktop) */}
        <aside className="hidden md:flex flex-col w-56 border-r border-stone-200 min-h-screen p-4 gap-1 bg-white">
          <button onClick={() => setPage("landing")} className="flex items-center gap-2 px-2 py-3 mb-4">
            <ThaliMark size={30} />
            <span className="font-display font-semibold">Thali</span>
          </button>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id ? "text-orange-50" : "text-stone-600 hover:bg-orange-50"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-emerald-900"
                  transition={calm ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <t.icon size={17} /> {t.label}
              </span>
            </button>
          ))}
        </aside>

        {/* mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 z-20">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${tab === t.id ? "text-emerald-900" : "text-stone-400"}`}
            >
              <motion.span animate={{ y: tab === t.id ? -2 : 0 }} transition={LIFT}>
                <t.icon size={19} />
              </motion.span>
              {t.label}
              {tab === t.id && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-emerald-900"
                  transition={calm ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          ))}
        </nav>

        <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 scene">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={calm ? { opacity: 0 } : { opacity: 0, y: 16, rotateX: -5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={calm ? { opacity: 0 } : { opacity: 0, y: -10, rotateX: 3 }}
              transition={GLIDE}
              style={{ transformPerspective: 1200 }}
            >
              {tab === "dashboard" && (
                <Dashboard
                  profile={profile}
                  todayCalories={todayCalories}
                  dailyStats={dailyStats}
                  setDailyStats={setDailyStats}
                  meals={meals}
                  bookings={bookings}
                  consultations={consultations}
                  runs={runs}
                  goTo={setTab}
                />
              )}
              {tab === "treadmill" && (
                <Treadmill
                  runs={runs}
                  setRuns={setRuns}
                  weightKg={weightLog[weightLog.length - 1]?.weight ?? 73}
                  setDailyStats={setDailyStats}
                />
              )}
              {tab === "snap" && <MealSnap meals={meals} setMeals={setMeals} />}
              {tab === "coach" && <AICoach messages={messages} setMessages={setMessages} />}
              {tab === "workouts" && <Workouts bookings={bookings} setBookings={setBookings} />}
              {tab === "coaches" && <Coaches consultations={consultations} setConsultations={setConsultations} />}
              {tab === "vitals" && <Vitals weightLog={weightLog} setWeightLog={setWeightLog} dailyStats={dailyStats} setDailyStats={setDailyStats} />}
            </motion.div>
          </AnimatePresence>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- shared page heading ---------- */
function PageHead({ title, children }) {
  const calm = useCalm();
  return (
    <div className="mb-6">
      <motion.h1
        className="font-display text-3xl font-semibold mb-1"
        initial={calm ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SETTLE, delay: 0.04 }}
      >
        {title}
      </motion.h1>
      <motion.p
        className="text-stone-500"
        initial={calm ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SETTLE, delay: 0.1 }}
      >
        {children}
      </motion.p>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ profile, todayCalories, dailyStats, setDailyStats, meals, bookings, consultations, runs, goTo }) {
  const calm = useCalm();
  const todaysMeals = meals.filter((m) => m.date === new Date().toDateString());
  const lastRun = runs[0];
  return (
    <div>
      <PageHead title={`Hey ${profile.name}`}>Here's your plate for today.</PageHead>

      <Stagger className="grid sm:grid-cols-3 gap-4 mb-8">
        <StaggerItem>
          <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between surface hover:surface-raised">
            <ProgressRing value={todayCalories} max={profile.calorieGoal} color="#1F3D2B" label="kcal" size={96} />
            <div className="text-sm text-stone-500 text-right">
              <p className="font-medium text-stone-900">Calories</p>
              <p className="font-mono">
                <CountUp to={todayCalories} /> / {profile.calorieGoal}
              </p>
            </div>
          </Tilt>
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Droplet} label="Water" value={dailyStats.water} unit="glasses" onAdd={() => setDailyStats((d) => ({ ...d, water: d.water + 1 }))} />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Moon} label="Sleep" value={dailyStats.sleep} unit="hrs" decimals={1} onAdd={() => setDailyStats((d) => ({ ...d, sleep: +(d.sleep + 0.5).toFixed(1) }))} />
        </StaggerItem>
      </Stagger>

      {/* Treadmill — the primary action, so it gets the full width and the
          filled treatment rather than sitting as a fifth item in a 2-up grid. */}
      <Reveal className="mb-4">
        <Tilt
          as="button"
          onClick={() => goTo("treadmill")}
          max={4}
          className="w-full bg-emerald-900 text-orange-50 rounded-2xl p-5 text-left flex items-center gap-4 surface-raised group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
            <motion.span
              animate={calm ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Footprints size={21} />
            </motion.span>
          </div>
          <div className="flex-1">
            <p className="font-display font-semibold text-lg">Treadmill</p>
            <p className="text-sm text-orange-100/80">
              {lastRun
                ? `Last run ${formatDuration(lastRun.durationSec)} · ${Math.round(lastRun.steps).toLocaleString()} steps`
                : "Start a session and track pace, steps and calories live"}
            </p>
          </div>
          <ChevronRight size={18} className="text-orange-100/70 transition-transform duration-200 group-hover:translate-x-1" />
        </Tilt>
      </Reveal>

      <Stagger className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { icon: Camera, title: "Log a meal", desc: "Snap a photo, get instant macros", to: "snap" },
          { icon: MessageCircle, title: "Ask your coach", desc: "Get a quick nutrition or workout tip", to: "coach" },
          { icon: Dumbbell, title: "Book a class", desc: `${bookings.length} class${bookings.length === 1 ? "" : "es"} booked`, to: "workouts" },
          { icon: Users, title: "Talk to an expert", desc: `${consultations.length} consult${consultations.length === 1 ? "" : "s"} booked`, to: "coaches" },
        ].map((q) => (
          <StaggerItem key={q.to}>
            <QuickLink icon={q.icon} title={q.title} desc={q.desc} onClick={() => goTo(q.to)} />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 surface">
          <h3 className="font-display font-semibold mb-3">Today's meals</h3>
          {todaysMeals.length === 0 ? (
            <p className="text-sm text-stone-500">Nothing logged yet. Head to Snap to add your first meal.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              <AnimatePresence initial={false}>
                {todaysMeals.map((m) => (
                  <motion.li
                    key={m.id}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={SETTLE}
                    className="py-2 flex justify-between text-sm"
                  >
                    <span>{m.items.map((i) => i.name).join(", ")}</span>
                    <span className="font-mono text-stone-500">{m.totalCalories} kcal</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, unit, decimals = 0, onAdd }) {
  const calm = useCalm();
  return (
    <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between surface hover:surface-raised">
      <div className="flex items-center justify-between mb-4">
        <Icon size={18} className="text-orange-700" />
        <motion.button
          onClick={onAdd}
          whileHover={calm ? undefined : { rotate: 90, scale: 1.15 }}
          whileTap={calm ? undefined : { scale: 0.85 }}
          transition={LIFT}
          className="text-stone-400 hover:text-emerald-900 transition-colors"
          aria-label={`Add ${label}`}
        >
          <Plus size={16} />
        </motion.button>
      </div>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="font-display text-xl font-semibold">
        <motion.span
          key={value}
          initial={calm ? false : { y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={LIFT}
          className="inline-block"
        >
          {decimals ? value.toFixed(decimals) : value}
        </motion.span>{" "}
        {unit}
      </p>
    </Tilt>
  );
}

function QuickLink({ icon: Icon, title, desc, onClick }) {
  const calm = useCalm();
  return (
    <Tilt
      as="button"
      onClick={onClick}
      max={5}
      className="w-full h-full bg-white rounded-2xl border border-stone-200 p-5 text-left flex items-center gap-4 hover:border-orange-300 transition-colors surface hover:surface-raised group"
    >
      <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
        <Icon size={19} className="text-orange-700" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-stone-500">{desc}</p>
      </div>
      <ChevronRight
        size={16}
        className="text-stone-400 transition-transform duration-200 group-hover:translate-x-1"
      />
    </Tilt>
  );
}

/* ================= TREADMILL =================
   Metrics are derived, not invented. Step count comes from speed and a
   stride length that grows with pace; calories come from the ACSM walking
   and running equations, which take incline and body weight into account.
   That is why the incline control changes the burn rate — it is a real
   input to the formula, not a decorative toggle.
   ============================================================ */
const SPEED_MAX = 20;
const INCLINE_MAX = 15;
const GOAL_KINDS = [
  { id: "steps", label: "Steps", unit: "steps", preset: 5000, step: 500 },
  { id: "kcal", label: "Calories", unit: "kcal", preset: 300, step: 25 },
  { id: "time", label: "Time", unit: "min", preset: 30, step: 5 },
];

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/* ACSM metabolic equations — ml/kg/min of oxygen, converted to kcal/min. */
function kcalPerMinute(speedKmh, inclinePct, weightKg) {
  if (speedKmh <= 0) return 0;
  const metresPerMin = (speedKmh * 1000) / 60;
  const grade = inclinePct / 100;
  const vo2 = speedKmh < 7
    ? 0.1 * metresPerMin + 1.8 * metresPerMin * grade + 3.5
    : 0.2 * metresPerMin + 0.9 * metresPerMin * grade + 3.5;
  return (vo2 * weightKg) / 1000 * 5;
}

/* Stride lengthens with pace, but walking and running scale differently —
   a single line overestimates cadence badly once you are running. Split at
   the same 7 km/h boundary the ACSM equations use. Calibrated so cadence
   lands near 100 spm at a 4 km/h walk and 175 spm at a 10 km/h run. */
function strideMetres(speedKmh) {
  return speedKmh < 7
    ? 0.463 + speedKmh * 0.051
    : 0.248 + speedKmh * 0.07;
}

function Treadmill({ runs, setRuns, weightKg, setDailyStats }) {
  const calm = useCalm();
  const [status, setStatus] = useState("idle"); // idle | running | paused
  const [speed, setSpeed] = useState(6);
  const [incline, setIncline] = useState(1);
  const [unit, setUnit] = useState("kmh");
  const [goal, setGoal] = useState({ kind: "steps", value: 5000 });

  const [elapsed, setElapsed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [kcal, setKcal] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [hr, setHr] = useState(76);
  const [trend, setTrend] = useState([]);
  const [summary, setSummary] = useState(null);

  /* The 1s tick reads live values through refs so the interval never has to
     be torn down and rebuilt every time speed or incline changes. */
  const speedRef = useRef(speed);
  const inclineRef = useRef(incline);
  const weightRef = useRef(weightKg);
  const elapsedRef = useRef(0);
  const hrRef = useRef(76);
  const peakRef = useRef(0);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { inclineRef.current = incline; }, [incline]);
  useEffect(() => { weightRef.current = weightKg; }, [weightKg]);

  useEffect(() => {
    if (status !== "running") return undefined;
    const id = window.setInterval(() => {
      const s = speedRef.current;
      const inc = inclineRef.current;
      const metresPerSec = s / 3.6;

      elapsedRef.current += 1;
      peakRef.current = Math.max(peakRef.current, s);

      setElapsed(elapsedRef.current);
      setSteps((prev) => prev + metresPerSec / strideMetres(s));
      setDistanceKm((prev) => prev + metresPerSec / 1000);
      setKcal((prev) => prev + kcalPerMinute(s, inc, weightRef.current) / 60);

      // Heart rate eases toward an intensity-driven target rather than jumping.
      const target = Math.min(190, 68 + s * 7.4 + inc * 2.6);
      const next = hrRef.current + (target - hrRef.current) * 0.12 + (Math.random() - 0.5) * 1.8;
      hrRef.current = Math.max(55, Math.min(198, next));
      setHr(hrRef.current);

      setTrend((prev) => [
        ...prev.slice(-59),
        { t: elapsedRef.current, speed: +s.toFixed(1), hr: Math.round(hrRef.current) },
      ]);
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const toDisplaySpeed = (kmh) => (unit === "kmh" ? kmh : kmh * 0.621371);
  const speedUnit = unit === "kmh" ? "km/h" : "mph";
  const distUnit = unit === "kmh" ? "km" : "mi";

  // Pace only means something while moving.
  const paceLabel = speed > 0.2
    ? (() => {
        const minPerUnit = 60 / toDisplaySpeed(speed);
        const m = Math.floor(minPerUnit);
        const s = Math.round((minPerUnit - m) * 60);
        return `${m}:${String(s).padStart(2, "0")} /${distUnit}`;
      })()
    : "—";

  const goalKind = GOAL_KINDS.find((g) => g.id === goal.kind);
  const goalCurrent = goal.kind === "steps" ? steps : goal.kind === "kcal" ? kcal : elapsed / 60;
  const goalPct = Math.min(1, goalCurrent / Math.max(1, goal.value));
  const goalMet = goalPct >= 1;

  const reset = () => {
    elapsedRef.current = 0;
    hrRef.current = 76;
    peakRef.current = 0;
    setElapsed(0); setSteps(0); setKcal(0); setDistanceKm(0); setHr(76); setTrend([]);
    setStatus("idle");
  };

  const stop = () => {
    if (elapsedRef.current === 0) { reset(); return; }
    const run = {
      id: Date.now(),
      date: new Date().toDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      durationSec: elapsedRef.current,
      steps: Math.round(steps),
      kcal: Math.round(kcal),
      distanceKm: +distanceKm.toFixed(2),
      avgSpeed: +((distanceKm / (elapsedRef.current / 3600)) || 0).toFixed(1),
      peakSpeed: +peakRef.current.toFixed(1),
      incline,
      goalKind: goal.kind,
      goalValue: goal.value,
      goalMet,
    };
    setRuns((prev) => [run, ...prev]);
    // Treadmill steps roll into today's total — one profile, not a silo.
    setDailyStats((d) => ({ ...d, steps: d.steps + run.steps }));
    setSummary(run);
    setStatus("idle");
  };

  const active = status === "running";
  const beltPeriod = Math.max(0.18, 44 / Math.max(speed * 6, 4));

  return (
    <div>
      <PageHead title="Treadmill">Start a session and watch pace, steps and burn in real time.</PageHead>

      {/* ---- the belt: speed readout over a surface that actually moves ---- */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-emerald-900 text-orange-50 p-6 mb-4 surface-raised">
          <div aria-hidden="true" className="absolute inset-0 opacity-60">
            <motion.div
              className="absolute inset-y-0 -left-1/4 w-[150%]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(251,247,238,0.13) 0 3px, transparent 3px 22px)",
              }}
              animate={active && !calm ? { x: [0, -44] } : { x: 0 }}
              transition={
                active && !calm
                  ? { duration: beltPeriod, repeat: Infinity, ease: "linear" }
                  : { duration: 0.3 }
              }
            />
          </div>

          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-orange-100/70 mb-2">
                {active ? "Running" : status === "paused" ? "Paused" : "Ready"}
              </p>
              <p className="font-mono text-6xl font-bold leading-none">
                {toDisplaySpeed(speed).toFixed(1)}
              </p>
              <p className="text-sm text-orange-100/80 mt-2">
                {speedUnit} · {paceLabel}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpeed((v) => Math.max(0, +(v - 0.5).toFixed(1)))}
                className="w-11 h-11 rounded-full bg-emerald-800 hover:bg-emerald-700 flex items-center justify-center transition-colors"
                aria-label="Decrease speed"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={() => setSpeed((v) => Math.min(SPEED_MAX, +(v + 0.5).toFixed(1)))}
                className="w-11 h-11 rounded-full bg-orange-50 text-emerald-900 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Increase speed"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center gap-4">
            <input
              type="range"
              min="0"
              max={SPEED_MAX}
              step="0.5"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 min-w-[180px] accent-amber-400"
              aria-label="Speed"
            />
            <button
              onClick={() => setUnit((u) => (u === "kmh" ? "mph" : "kmh"))}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-700 transition-colors"
            >
              {speedUnit}
            </button>
          </div>
        </div>
      </Reveal>

      {/* ---- controls ---- */}
      <Reveal delay={0.04}>
        <div className="flex flex-wrap gap-3 mb-6">
          {status !== "running" ? (
            <motion.button
              onClick={() => setStatus("running")}
              whileHover={calm ? undefined : { y: -3 }}
              whileTap={calm ? undefined : { scale: 0.97 }}
              transition={LIFT}
              className="bg-emerald-900 text-orange-50 px-7 py-3 rounded-full font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 surface"
            >
              <Play size={17} fill="currentColor" /> {elapsed > 0 ? "Resume" : "Start"}
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setStatus("paused")}
              whileHover={calm ? undefined : { y: -3 }}
              whileTap={calm ? undefined : { scale: 0.97 }}
              transition={LIFT}
              className="bg-amber-500 text-stone-900 px-7 py-3 rounded-full font-medium hover:bg-amber-400 transition-colors flex items-center gap-2 surface"
            >
              <Pause size={17} fill="currentColor" /> Pause
            </motion.button>
          )}
          <motion.button
            onClick={stop}
            disabled={elapsed === 0}
            whileHover={calm || elapsed === 0 ? undefined : { y: -3 }}
            whileTap={calm || elapsed === 0 ? undefined : { scale: 0.97 }}
            transition={LIFT}
            className="border border-stone-300 px-7 py-3 rounded-full font-medium hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <Square size={15} fill="currentColor" /> Stop
          </motion.button>
        </div>
      </Reveal>

      {/* ---- live metrics ---- */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StaggerItem>
          <Metric icon={Gauge} label="Pace" value={toDisplaySpeed(speed).toFixed(1)} unit={speedUnit} sub={paceLabel} live={active} />
        </StaggerItem>
        <StaggerItem>
          <Metric icon={Footprints} label="Steps" value={Math.round(steps).toLocaleString()} live={active} />
        </StaggerItem>
        <StaggerItem>
          <Metric icon={Flame} label="Calories" value={Math.round(kcal)} unit="kcal" live={active} />
        </StaggerItem>
        <StaggerItem>
          <Metric icon={Clock} label="Duration" value={formatDuration(elapsed)} live={active} />
        </StaggerItem>
      </Stagger>

      {/* ---- incline + goal ---- */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Reveal>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 h-full surface">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-sm text-stone-500">
                <Mountain size={16} className="text-orange-700" /> Incline
              </span>
              <span className="font-mono text-lg font-semibold">{incline.toFixed(1)}%</span>
            </div>

            {/* the ramp reflects the actual grade */}
            <div className="relative h-14 mb-4 rounded-xl bg-orange-50 overflow-hidden">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-emerald-900/85"
                style={{ originX: 0, originY: 1 }}
                animate={{ rotate: -(incline / INCLINE_MAX) * 32, height: "42%" }}
                transition={SETTLE}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncline((v) => Math.max(0, +(v - 0.5).toFixed(1)))}
                className="w-9 h-9 rounded-full border border-stone-300 hover:bg-orange-50 flex items-center justify-center transition-colors"
                aria-label="Decrease incline"
              >
                <Minus size={15} />
              </button>
              <input
                type="range"
                min="0"
                max={INCLINE_MAX}
                step="0.5"
                value={incline}
                onChange={(e) => setIncline(parseFloat(e.target.value))}
                className="flex-1 accent-emerald-900"
                aria-label="Incline"
              />
              <button
                onClick={() => setIncline((v) => Math.min(INCLINE_MAX, +(v + 0.5).toFixed(1)))}
                className="w-9 h-9 rounded-full border border-stone-300 hover:bg-orange-50 flex items-center justify-center transition-colors"
                aria-label="Increase incline"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="bg-white rounded-2xl border border-stone-200 p-5 h-full surface">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-sm text-stone-500">
                <Target size={16} className="text-orange-700" /> Goal
              </span>
              {goalMet && (
                <motion.span
                  initial={calm ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={LIFT}
                  className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Check size={12} /> Reached
                </motion.span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              {GOAL_KINDS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal({ kind: g.id, value: g.preset })}
                  disabled={elapsed > 0}
                  className={`relative flex-1 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    goal.kind === g.id ? "text-orange-50 border-emerald-900" : "border-stone-300 text-stone-600 hover:bg-orange-50"
                  }`}
                >
                  {goal.kind === g.id && (
                    <motion.span
                      layoutId="goal-pill"
                      className="absolute inset-0 rounded-full bg-emerald-900"
                      transition={calm ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{g.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setGoal((g) => ({ ...g, value: Math.max(goalKind.step, g.value - goalKind.step) }))}
                disabled={elapsed > 0}
                className="w-9 h-9 rounded-full border border-stone-300 hover:bg-orange-50 flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Lower goal"
              >
                <Minus size={15} />
              </button>
              <p className="flex-1 text-center font-mono text-lg font-semibold">
                {goal.value.toLocaleString()} <span className="text-sm font-normal text-stone-500">{goalKind.unit}</span>
              </p>
              <button
                onClick={() => setGoal((g) => ({ ...g, value: g.value + goalKind.step }))}
                disabled={elapsed > 0}
                className="w-9 h-9 rounded-full border border-stone-300 hover:bg-orange-50 flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Raise goal"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${goalMet ? "bg-emerald-700" : "bg-amber-500"}`}
                animate={{ width: `${goalPct * 100}%` }}
                transition={{ duration: calm ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {Math.round(goalCurrent).toLocaleString()} of {goal.value.toLocaleString()} {goalKind.unit}
              {elapsed > 0 ? "" : " · set before you start"}
            </p>
          </div>
        </Reveal>
      </div>

      {/* ---- live trend ---- */}
      <Reveal delay={0.08}>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 surface">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-display font-semibold">Speed &amp; heart rate</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-stone-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-900" /> Speed
              </span>
              <span className="flex items-center gap-1.5 text-stone-500">
                <Heart size={12} className="text-orange-700" fill="currentColor" />
                <motion.span
                  className="font-mono"
                  animate={active && !calm ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                  transition={active && !calm ? { duration: Math.max(0.4, 60 / hr), repeat: Infinity, ease: "easeInOut" } : undefined}
                >
                  {Math.round(hr)} bpm
                </motion.span>
              </span>
            </div>
          </div>

          {trend.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-stone-400">
              Press Start — the trend fills in as you run.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <ComposedChart data={trend}>
                <defs>
                  <linearGradient id="speedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F3D2B" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1F3D2B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D8" />
                <XAxis dataKey="t" tickFormatter={formatDuration} tick={{ fontSize: 11 }} stroke="#B4AD98" />
                <YAxis yAxisId="s" tick={{ fontSize: 11 }} stroke="#B4AD98" width={30} />
                <YAxis yAxisId="h" orientation="right" domain={[50, 200]} tick={{ fontSize: 11 }} stroke="#B4AD98" width={34} />
                <Tooltip
                  labelFormatter={(v) => formatDuration(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E7DFCC",
                    boxShadow: "6px 10px 20px -8px rgba(84,62,33,0.28)",
                  }}
                />
                {/* Live data: no transition animation, or every tick would re-draw. */}
                <Area yAxisId="s" type="monotone" dataKey="speed" stroke="#1F3D2B" strokeWidth={2} fill="url(#speedFill)" isAnimationActive={false} name="Speed" />
                <Line yAxisId="h" type="monotone" dataKey="hr" stroke="#C1571F" strokeWidth={2} dot={false} isAnimationActive={false} name="Heart rate" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </Reveal>

      {/* ---- history ---- */}
      <h3 className="font-display font-semibold mb-3">Past runs ({runs.length})</h3>
      {runs.length === 0 ? (
        <p className="text-sm text-stone-500">No runs yet. Your first session will show up here.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {runs.map((r) => (
              <motion.li
                key={r.id}
                layout
                initial={calm ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24 }}
                transition={SETTLE}
                className="bg-white rounded-xl border border-stone-200 p-4 flex justify-between items-center text-sm surface gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium flex items-center gap-2">
                    {formatDuration(r.durationSec)} · {r.distanceKm} km
                    {r.goalMet && <Trophy size={13} className="text-amber-500 shrink-0" />}
                  </p>
                  <p className="text-stone-500 truncate">{r.date} · {r.time} · {r.incline}% incline</p>
                </div>
                <div className="text-right font-mono text-stone-600 shrink-0">
                  <p>{r.steps.toLocaleString()} steps</p>
                  <p className="text-xs text-stone-400">{r.kcal} kcal</p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <RunSummary run={summary} onClose={() => { setSummary(null); reset(); }} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, unit, sub, live }) {
  const calm = useCalm();
  return (
    <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-4 surface hover:surface-raised">
      <div className="flex items-center justify-between mb-3">
        <Icon size={16} className="text-orange-700" />
        {live && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-emerald-700"
            animate={calm ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="font-mono text-2xl font-bold leading-tight">
        {value}
        {unit && <span className="text-sm font-normal text-stone-500"> {unit}</span>}
      </p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </Tilt>
  );
}

function RunSummary({ run, onClose }) {
  const calm = useCalm();
  return (
    <AnimatePresence>
      {run && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Workout summary"
        >
          <motion.div
            className="bg-orange-50 rounded-2xl p-7 w-full max-w-sm surface-raised"
            initial={calm ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.94, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={calm ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }}
            transition={SETTLE}
            style={{ transformPerspective: 1000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  run.goalMet ? "bg-amber-400 text-stone-900" : "bg-emerald-900 text-orange-50"
                }`}
                initial={calm ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...LIFT, delay: 0.1 }}
              >
                {run.goalMet ? <Trophy size={24} /> : <Check size={24} />}
              </motion.div>
            </div>

            <h3 className="font-display text-2xl font-semibold text-center mb-1">
              {run.goalMet ? "Goal smashed" : "Session logged"}
            </h3>
            <p className="text-sm text-stone-500 text-center mb-6">
              {run.goalMet
                ? `You passed your ${run.goalValue.toLocaleString()} ${run.goalKind === "time" ? "min" : run.goalKind} target.`
                : "Every run counts. Here's how it went."}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ["Duration", formatDuration(run.durationSec)],
                ["Distance", `${run.distanceKm} km`],
                ["Steps", run.steps.toLocaleString()],
                ["Calories", `${run.kcal} kcal`],
                ["Avg speed", `${run.avgSpeed} km/h`],
                ["Peak speed", `${run.peakSpeed} km/h`],
              ].map(([label, value], i) => (
                <motion.div
                  key={label}
                  className="bg-white rounded-xl p-3 border border-stone-200"
                  initial={calm ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SETTLE, delay: 0.14 + i * 0.05 }}
                >
                  <p className="text-xs text-stone-500">{label}</p>
                  <p className="font-mono font-semibold">{value}</p>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={onClose}
              whileHover={calm ? undefined : { y: -2 }}
              whileTap={calm ? undefined : { scale: 0.97 }}
              transition={LIFT}
              className="w-full bg-emerald-900 text-orange-50 py-3 rounded-full font-medium hover:bg-emerald-800 transition-colors surface"
            >
              Done
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Meal Snap (AI vision) ---------- */
function MealSnap({ meals, setMeals }) {
  const calm = useCalm();
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mime, setMime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    setResult(null);
    setMime(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!base64) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mime || "image/jpeg", data: base64 } },
                {
                  type: "text",
                  text: "Identify the foods in this meal photo and estimate nutrition. Respond ONLY with raw JSON, no markdown fences, no preamble, exactly this shape: {\"items\":[{\"name\":string,\"calories\":number}],\"totalCalories\":number,\"protein_g\":number,\"carbs_g\":number,\"fat_g\":number,\"note\":string}. Keep note under 20 words and encouraging.",
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = (data.content || []).map((b) => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Couldn't analyze that photo. Try another one.");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = () => {
    if (!result) return;
    setMeals((prev) => [
      { id: Date.now(), date: new Date().toDateString(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...result },
      ...prev,
    ]);
    setResult(null);
    setPreview(null);
    setBase64(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setPreview(null);
    setResult(null);
    setBase64(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <PageHead title="Meal snap">Photograph your plate, AI does the counting.</PageHead>

      <motion.div layout className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 surface">
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.label
              key="drop"
              initial={calm ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={calm ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={GLIDE}
              whileHover={calm ? undefined : { scale: 1.01 }}
              className="border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center py-14 cursor-pointer hover:border-orange-400 transition-colors"
            >
              <motion.span
                animate={calm ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Upload size={26} className="text-orange-700 mb-3" />
              </motion.span>
              <p className="font-medium">Upload a meal photo</p>
              <p className="text-sm text-stone-500">JPG or PNG</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </motion.label>
          ) : (
            <motion.div
              key="preview"
              initial={calm ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={calm ? { opacity: 0 } : { opacity: 0, y: -14 }}
              transition={GLIDE}
              className="grid sm:grid-cols-2 gap-6 items-start"
            >
              <motion.img
                src={preview}
                alt="Meal preview"
                className="rounded-xl w-full object-cover max-h-80 surface"
                initial={calm ? { opacity: 0 } : { opacity: 0, scale: 0.94, rotateY: -8 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={SETTLE}
                style={{ transformPerspective: 900 }}
              />
              <div>
                {!result && (
                  <motion.button
                    onClick={analyze}
                    disabled={loading}
                    whileHover={calm || loading ? undefined : { y: -3 }}
                    whileTap={calm || loading ? undefined : { scale: 0.97 }}
                    transition={LIFT}
                    className="bg-emerald-900 text-orange-50 px-5 py-2.5 rounded-full font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 disabled:opacity-60 surface"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {loading ? "Analyzing…" : "Analyze meal"}
                  </motion.button>
                )}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={SETTLE}
                    className="text-sm text-red-600 mt-3"
                  >
                    {error}
                  </motion.p>
                )}
                {result && (
                  <motion.div
                    initial={calm ? { opacity: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={SETTLE}
                  >
                    <p className="font-display text-2xl font-semibold mb-2">
                      <CountUp to={result.totalCalories || 0} /> kcal
                    </p>
                    <Stagger className="text-sm text-stone-600 mb-3 space-y-1" step={0.05}>
                      {result.items?.map((it, i) => (
                        <StaggerItem key={i} y={10}>
                          <div className="flex justify-between">
                            <span>{it.name}</span>
                            <span className="font-mono">{it.calories} kcal</span>
                          </div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                    <div className="flex gap-3 text-xs text-stone-500 mb-3 font-mono">
                      <span>P {result.protein_g}g</span>
                      <span>C {result.carbs_g}g</span>
                      <span>F {result.fat_g}g</span>
                    </div>
                    {result.note && <p className="text-sm text-emerald-800 mb-4">{result.note}</p>}
                    <div className="flex gap-3">
                      <motion.button
                        onClick={logMeal}
                        whileHover={calm ? undefined : { y: -3 }}
                        whileTap={calm ? undefined : { scale: 0.97 }}
                        transition={LIFT}
                        className="bg-emerald-900 text-orange-50 px-5 py-2.5 rounded-full font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2 surface"
                      >
                        <Check size={16} /> Log this meal
                      </motion.button>
                      <motion.button
                        onClick={reset}
                        whileHover={calm ? undefined : { y: -3 }}
                        whileTap={calm ? undefined : { scale: 0.97 }}
                        transition={LIFT}
                        className="border border-stone-300 px-5 py-2.5 rounded-full font-medium hover:bg-orange-50 transition-colors"
                      >
                        Retake
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <h3 className="font-display font-semibold mb-3">History</h3>
      {meals.length === 0 ? (
        <p className="text-sm text-stone-500">No meals logged yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {meals.map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={calm ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24 }}
                transition={SETTLE}
                className="bg-white rounded-xl border border-stone-200 p-4 flex justify-between text-sm surface"
              >
                <div>
                  <p className="font-medium">{m.items?.map((i) => i.name).join(", ")}</p>
                  <p className="text-stone-500">{m.date} · {m.time}</p>
                </div>
                <span className="font-mono self-center">{m.totalCalories} kcal</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* ---------- AI Coach ---------- */
function AICoach({ messages, setMessages }) {
  const calm = useCalm();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: "You are Sage, a warm, encouraging AI health and nutrition coach inside a wellness app. Give concise, practical, evidence-based advice on diet, workouts and habits. Keep replies short — a few sentences, occasionally a short list. Never give medical diagnoses; suggest a doctor for medical concerns.",
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = (data.content || []).map((b) => b.text || "").join("");
      setMessages((prev) => [...prev, { role: "assistant", content: reply || "Sorry, I couldn't respond just now." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong reaching the coach. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-190px)] md:h-[calc(100vh-140px)]">
      <PageHead title="Coach Sage">Your AI coach — ask about food, workouts, or habits.</PageHead>

      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-stone-200 p-4 mb-4 space-y-3 surface">
        {messages.length === 0 && (
          <p className="text-sm text-stone-500">Try: "What's a good high-protein Indian breakfast?"</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              layout
              initial={calm ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={SETTLE}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-emerald-900 text-orange-50" : "bg-orange-50 text-stone-800"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SETTLE}
              className="flex justify-start"
            >
              <div className="bg-orange-50 rounded-2xl px-4 py-2.5 text-sm text-stone-500 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Sage is thinking…
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Sage anything…"
          className="flex-1 border border-stone-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-emerald-800 transition-colors"
        />
        <motion.button
          onClick={send}
          disabled={loading}
          whileHover={calm || loading ? undefined : { y: -2, scale: 1.05 }}
          whileTap={calm || loading ? undefined : { scale: 0.92 }}
          transition={LIFT}
          className="bg-emerald-900 text-orange-50 rounded-full w-11 h-11 flex items-center justify-center shrink-0 hover:bg-emerald-800 transition-colors disabled:opacity-60 surface"
          aria-label="Send message"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}

/* ---------- Workouts ---------- */
const WORKOUT_LIBRARY = [
  { id: 1, name: "Sunrise Strength", trainer: "Aditi Rao", format: "Strength", duration: "45 min", time: "6:30 AM" },
  { id: 2, name: "Evolve Yoga Flow", trainer: "Karan Mehta", format: "Yoga", duration: "40 min", time: "7:00 AM" },
  { id: 3, name: "Bollywood Burn", trainer: "Sana Iyer", format: "Dance", duration: "35 min", time: "6:00 PM" },
  { id: 4, name: "HRX Full Body", trainer: "Vikram Nair", format: "Strength", duration: "50 min", time: "7:00 PM" },
  { id: 5, name: "Core & Mobility", trainer: "Priya Das", format: "Cardio", duration: "30 min", time: "5:30 PM" },
  { id: 6, name: "Restorative Yoga", trainer: "Karan Mehta", format: "Yoga", duration: "30 min", time: "9:00 PM" },
];
const FORMATS = ["All", "Strength", "Yoga", "Dance", "Cardio"];

function Workouts({ bookings, setBookings }) {
  const calm = useCalm();
  const [filter, setFilter] = useState("All");
  const list = filter === "All" ? WORKOUT_LIBRARY : WORKOUT_LIBRARY.filter((w) => w.format === filter);
  const isBooked = (id) => bookings.some((b) => b.id === id);
  const toggle = (w) => {
    setBookings((prev) => (isBooked(w.id) ? prev.filter((b) => b.id !== w.id) : [...prev, w]));
  };

  return (
    <div>
      <PageHead title="Move">Book a live class or queue up on-demand workouts.</PageHead>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FORMATS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f ? "text-orange-50 border-emerald-900" : "border-stone-300 text-stone-600 hover:bg-white"
            }`}
          >
            {filter === f && (
              <motion.span
                layoutId="format-pill"
                className="absolute inset-0 rounded-full bg-emerald-900"
                transition={calm ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid sm:grid-cols-2 gap-4 mb-10">
        <AnimatePresence mode="popLayout">
          {list.map((w) => (
            <motion.div
              key={w.id}
              layout
              initial={calm ? { opacity: 0 } : { opacity: 0, y: 20, rotateX: -8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={calm ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={SETTLE}
              style={{ transformPerspective: 1000 }}
            >
              <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-5 surface hover:surface-raised">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{w.format}</span>
                  <span className="text-xs text-stone-400 flex items-center gap-1"><Clock size={12} /> {w.duration}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{w.name}</h3>
                <p className="text-sm text-stone-500 mb-4">with {w.trainer} · {w.time}</p>
                <motion.button
                  onClick={() => toggle(w)}
                  whileTap={calm ? undefined : { scale: 0.96 }}
                  transition={LIFT}
                  className={`w-full py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    isBooked(w.id) ? "bg-emerald-50 text-emerald-800 border border-emerald-800" : "bg-emerald-900 text-orange-50 hover:bg-emerald-800"
                  }`}
                >
                  {isBooked(w.id) ? (
                    <motion.span
                      initial={calm ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={LIFT}
                      className="flex items-center gap-2"
                    >
                      <Check size={14} /> Booked
                    </motion.span>
                  ) : "Book class"}
                </motion.button>
              </Tilt>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <h3 className="font-display font-semibold mb-3">Your bookings ({bookings.length})</h3>
      {bookings.length === 0 ? (
        <p className="text-sm text-stone-500">No classes booked yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {bookings.map((b) => (
              <motion.li
                key={b.id}
                layout
                initial={calm ? { opacity: 0 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={SETTLE}
                className="bg-white rounded-xl border border-stone-200 p-4 flex justify-between items-center text-sm surface"
              >
                <span>{b.name} · {b.time}</span>
                <motion.button
                  onClick={() => toggle(b)}
                  whileHover={calm ? undefined : { rotate: 90, scale: 1.15 }}
                  whileTap={calm ? undefined : { scale: 0.85 }}
                  transition={LIFT}
                  className="text-stone-400 hover:text-red-600 transition-colors"
                  aria-label="Cancel booking"
                >
                  <X size={16} />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* ---------- Coaches marketplace ---------- */
const COACH_LIST = [
  { id: 1, name: "Dr. Neha Kapoor", specialty: "Weight loss dietitian", rating: 4.9, price: "₹999/session" },
  { id: 2, name: "Rohan Bhatia", specialty: "Strength & conditioning coach", rating: 4.8, price: "₹799/session" },
  { id: 3, name: "Meera Iyengar", specialty: "PCOS & hormonal nutrition", rating: 4.9, price: "₹1,199/session" },
  { id: 4, name: "Arjun Malhotra", specialty: "Sports injury rehab", rating: 4.7, price: "₹899/session" },
];

function Coaches({ consultations, setConsultations }) {
  const calm = useCalm();
  const isBooked = (id) => consultations.some((c) => c.id === id);
  const toggle = (coach) => {
    setConsultations((prev) => (isBooked(coach.id) ? prev.filter((c) => c.id !== coach.id) : [...prev, coach]));
  };
  return (
    <div>
      <PageHead title="Consult">Book a real 1:1 session with a certified expert.</PageHead>

      <Stagger className="grid sm:grid-cols-2 gap-4 mb-10">
        {COACH_LIST.map((c) => (
          <StaggerItem key={c.id}>
            <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-5 surface hover:surface-raised">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="w-11 h-11 rounded-full bg-emerald-900 text-orange-50 flex items-center justify-center font-display font-semibold shrink-0"
                  whileHover={calm ? undefined : { rotateY: 180 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformPerspective: 600 }}
                >
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </motion.div>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-stone-500">{c.specialty}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="flex items-center gap-1 text-amber-600 font-medium"><Star size={13} fill="currentColor" /> {c.rating}</span>
                <span className="font-mono text-stone-600">{c.price}</span>
              </div>
              <motion.button
                onClick={() => toggle(c)}
                whileTap={calm ? undefined : { scale: 0.96 }}
                transition={LIFT}
                className={`w-full py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  isBooked(c.id) ? "bg-emerald-50 text-emerald-800 border border-emerald-800" : "bg-emerald-900 text-orange-50 hover:bg-emerald-800"
                }`}
              >
                {isBooked(c.id) ? (
                  <motion.span
                    initial={calm ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={LIFT}
                    className="flex items-center gap-2"
                  >
                    <Check size={14} /> Booked
                  </motion.span>
                ) : "Book consultation"}
              </motion.button>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>

      <h3 className="font-display font-semibold mb-3">Your consultations ({consultations.length})</h3>
      {consultations.length === 0 ? (
        <p className="text-sm text-stone-500">No consultations booked yet.</p>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {consultations.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={calm ? { opacity: 0 } : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={SETTLE}
                className="bg-white rounded-xl border border-stone-200 p-4 flex justify-between items-center text-sm surface"
              >
                <span>{c.name} · {c.specialty}</span>
                <motion.button
                  onClick={() => toggle(c)}
                  whileHover={calm ? undefined : { rotate: 90, scale: 1.15 }}
                  whileTap={calm ? undefined : { scale: 0.85 }}
                  transition={LIFT}
                  className="text-stone-400 hover:text-red-600 transition-colors"
                  aria-label="Cancel consultation"
                >
                  <X size={16} />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

/* ---------- Vitals ---------- */
function Vitals({ weightLog, setWeightLog, dailyStats, setDailyStats }) {
  const calm = useCalm();
  const [newWeight, setNewWeight] = useState("");
  const sleepData = [
    { day: "Mon", hrs: 6.2 }, { day: "Tue", hrs: 7.1 }, { day: "Wed", hrs: 6.8 },
    { day: "Thu", hrs: 5.9 }, { day: "Fri", hrs: 7.4 }, { day: "Sat", hrs: 8.0 }, { day: "Sun", hrs: dailyStats.sleep },
  ];

  const addWeight = () => {
    const val = parseFloat(newWeight);
    if (!val) return;
    setWeightLog((prev) => [...prev.slice(1), { date: "Today", weight: val }]);
    setNewWeight("");
  };

  const latest = weightLog[weightLog.length - 1]?.weight;

  return (
    <div>
      <PageHead title="Vitals">Your body's trends, in one place.</PageHead>

      <Stagger className="grid sm:grid-cols-3 gap-4 mb-8">
        <StaggerItem>
          <MiniStat icon={Weight} label="Weight" value={latest} unit="kg" decimals={1} />
        </StaggerItem>
        <StaggerItem>
          <MiniStat icon={Footprints} label="Steps today" value={dailyStats.steps} />
        </StaggerItem>
        <StaggerItem>
          <MiniStat icon={Flame} label="Resting HRV" value={52} unit="ms" />
        </StaggerItem>
      </Stagger>

      {/* Charts get a reveal, never a tilt — skewing data would misrepresent it. */}
      <Reveal>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 surface">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-display font-semibold">Weight trend (7 days)</h3>
            <div className="flex gap-2">
              <input
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWeight()}
                placeholder="Log kg"
                className="w-20 border border-stone-300 rounded-full px-3 py-1 text-sm outline-none focus:border-emerald-800 transition-colors"
              />
              <motion.button
                onClick={addWeight}
                whileHover={calm ? undefined : { y: -2 }}
                whileTap={calm ? undefined : { scale: 0.95 }}
                transition={LIFT}
                className="bg-emerald-900 text-orange-50 rounded-full px-3 py-1 text-sm hover:bg-emerald-800 transition-colors"
              >
                Add
              </motion.button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightLog}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D8" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#B4AD98" />
              <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 12 }} stroke="#B4AD98" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E7DFCC",
                  boxShadow: "6px 10px 20px -8px rgba(84,62,33,0.28)",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#1F3D2B"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                isAnimationActive={!calm}
                animationDuration={1400}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6 surface">
          <h3 className="font-display font-semibold mb-4">Sleep this week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D8" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#B4AD98" />
              <YAxis tick={{ fontSize: 12 }} stroke="#B4AD98" />
              <Tooltip
                cursor={{ fill: "rgba(184,121,30,0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E7DFCC",
                  boxShadow: "6px 10px 20px -8px rgba(84,62,33,0.28)",
                }}
              />
              <Bar
                dataKey="hrs"
                fill="#B8791E"
                radius={[4, 4, 0, 0]}
                isAnimationActive={!calm}
                animationDuration={1100}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Tilt max={4} className="bg-emerald-900 text-orange-50 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4 surface-raised">
          <div>
            <h3 className="font-display font-semibold text-lg mb-1">Want the full picture?</h3>
            <p className="text-sm text-orange-100/80">Book an at-home lab test to see 100+ biomarkers alongside these trends.</p>
          </div>
          <motion.button
            whileHover={calm ? undefined : { y: -3 }}
            whileTap={calm ? undefined : { scale: 0.97 }}
            transition={LIFT}
            className="bg-orange-50 text-emerald-900 px-5 py-2.5 rounded-full font-medium hover:bg-white transition-colors shrink-0"
          >
            Book a lab test
          </motion.button>
        </Tilt>
      </Reveal>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, unit, decimals = 0 }) {
  return (
    <Tilt className="h-full bg-white rounded-2xl border border-stone-200 p-5 surface hover:surface-raised">
      <Icon size={18} className="text-orange-700 mb-3" />
      <p className="text-sm text-stone-500">{label}</p>
      <p className="font-display text-xl font-semibold">
        {value === undefined || value === null ? "—" : <CountUp to={value} decimals={decimals} />}
        {unit ? ` ${unit}` : ""}
      </p>
    </Tilt>
  );
}
