import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/* ============================================================
   One physical rule for the whole product:

   Objects rest on a table under a warm light from the top-left.
   Depth is elevation off that table — never random float.
   Every shadow agrees about where the light is.

   SETTLE  an object coming to rest on the surface
   LIFT    an object being picked up
   GLIDE   an object sliding across the surface
   ============================================================ */
export const SETTLE = { type: "spring", stiffness: 240, damping: 26, mass: 0.9 };
export const LIFT = { type: "spring", stiffness: 340, damping: 30, mass: 0.6 };
export const GLIDE = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

/** Reduced-motion, normalized to a plain boolean. */
export function useCalm() {
  return useReducedMotion() === true;
}

/* ---------- Reveal: an object settling onto the table ---------- */
export function Reveal({ children, delay = 0, y = 26, className, style }) {
  const calm = useCalm();
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1000, ...style }}
      initial={calm ? { opacity: 0 } : { opacity: 0, y, rotateX: -6 }}
      whileInView={calm ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...SETTLE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Stagger: a set of objects set down in sequence ---------- */
export function Stagger({ children, className, step = 0.06, style }) {
  const calm = useCalm();
  return (
    <motion.div
      className={className}
      style={style}
      initial="rest"
      whileInView="settled"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ settled: { transition: { staggerChildren: calm ? 0 : step } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style, y = 22 }) {
  const calm = useCalm();
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1000, ...style }}
      variants={{
        rest: calm ? { opacity: 0 } : { opacity: 0, y, rotateX: -8 },
        settled: calm ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0 },
      }}
      transition={SETTLE}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Tilt: an object you can lean over and pick up ----------
   The card rotates toward the cursor and lifts along Z. Because the
   light is fixed top-left, the shadow lengthens down-right as it rises. */
export function Tilt({
  children,
  className,
  onClick,
  max = 6,
  lift = 16,
  as = "div",
  ...rest
}) {
  const calm = useCalm();
  const ref = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), LIFT);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), LIFT);

  const Tag = as === "button" ? motion.button : motion.div;

  const track = (e) => {
    if (calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const release = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <Tag
      ref={ref}
      className={className}
      onClick={onClick}
      onPointerMove={track}
      onPointerLeave={release}
      style={
        calm
          ? undefined
          : { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
      }
      whileHover={calm ? undefined : { z: lift }}
      whileTap={calm ? undefined : { z: 4 }}
      transition={LIFT}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ---------- CountUp: numbers that arrive rather than appear ---------- */
export function CountUp({ to, duration = 1.3, decimals = 0, className }) {
  const calm = useCalm();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(calm ? to : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (calm) {
      setN(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setN,
    });
    return () => controls.stop();
  }, [inView, to, duration, calm]);

  return (
    <span ref={ref} className={className}>
      {decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString()}
    </span>
  );
}

/* ---------- Surface: the warm pool of light the page sits in ---------- */
export function TableLight({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute -top-40 left-1/4 h-[520px] w-[520px] rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, #F6E2BE 0%, rgba(246,226,190,0) 68%)" }}
      />
      <div
        className="absolute top-24 right-0 h-[420px] w-[420px] rounded-full blur-3xl opacity-35"
        style={{ background: "radial-gradient(circle, #E9C9A8 0%, rgba(233,201,168,0) 70%)" }}
      />
    </div>
  );
}

/* ============================================================
   THE SIGNATURE — the thali as a plate on a table.

   A real thali is a metal plate holding five katoris. Rendered flat
   it reads as a pie chart; tilted into perspective it reads as the
   object it actually is. The cursor leans over it, each wedge lifts
   like a katori being picked up, and the labels counter-rotate so
   they stay legible while the plate itself is foreshortened.
   ============================================================ */
const TILT = 54; // degrees of lean — enough to read as a plate, not so much it collapses

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

export function Thali3D({ modules, onPick }) {
  const calm = useCalm();
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const [serving, setServing] = useState(null);

  const S = 340;
  const C = S / 2;
  const R = 150;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Cursor Y leans the plate; cursor X spins it, like nudging a lazy susan.
  const lean = useSpring(useTransform(py, [0, 1], [TILT - 13, TILT + 9]), {
    stiffness: 90,
    damping: 20,
  });
  const spin = useSpring(useTransform(px, [0, 1], [-17, 17]), {
    stiffness: 90,
    damping: 20,
  });

  const plate = useMotionTemplate`rotateX(${lean}deg) rotateZ(${spin}deg)`;

  // Exact inverse of the plate transform, so text faces the viewer head-on.
  const negLean = useTransform(lean, (v) => -v);
  const negSpin = useTransform(spin, (v) => -v);
  const faceMe = useMotionTemplate`rotateZ(${negSpin}deg) rotateX(${negLean}deg)`;

  const track = (e) => {
    if (calm || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const release = () => {
    px.set(0.5);
    py.set(0.5);
    setHover(null);
  };

  // Serve: the chosen katori rises off the plate, then the page turns.
  const choose = (id) => {
    if (calm) return onPick(id);
    setServing(id);
    window.setTimeout(() => onPick(id), 340);
  };

  /* Reduced motion: a flat, still plate. Same information, no movement. */
  if (calm) {
    return (
      <div className="mx-auto w-full max-w-sm">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full">
          <circle cx={C} cy={C} r={R + 10} fill="#FBF7EE" stroke="#E7DFCC" strokeWidth="2" />
          {modules.map((m, i) => (
            <g key={m.id} onClick={() => onPick(m.id)} style={{ cursor: "pointer" }}>
              <path
                d={wedgePath(C, C, R, i * 72, i * 72 + 72)}
                fill={m.fill}
                stroke="#FBF7EE"
                strokeWidth="3"
              />
              <text
                x={polarToCartesian(C, C, R * 0.62, i * 72 + 36).x}
                y={polarToCartesian(C, C, R * 0.62, i * 72 + 36).y}
                textAnchor="middle"
                fill="#FBF7EE"
                fontSize="13"
                fontWeight="600"
              >
                {m.label}
              </text>
            </g>
          ))}
          <circle cx={C} cy={C} r={38} fill="#FBF7EE" stroke="#E7DFCC" strokeWidth="2" />
          <text x={C} y={C - 2} textAnchor="middle" fontSize="11" fill="#7A6F58">
            one plate,
          </text>
          <text x={C} y={C + 13} textAnchor="middle" fontSize="11" fill="#7A6F58">
            every habit
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-md select-none"
      style={{ perspective: 1000, perspectiveOrigin: "50% 42%" }}
      onPointerMove={track}
      onPointerLeave={release}
      ref={ref}
    >
      {/* the table beneath the plate */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[62%] h-16 w-[74%] -translate-x-1/2 rounded-[50%] blur-2xl"
        style={{ background: "rgba(84, 62, 33, 0.28)" }}
      />

      {/* Three separate layers on purpose. A framer-motion `transform` string
          in `style` replaces the whole transform property, so anything driven
          by `animate` (scale, the ambient spin) has to live on its own node. */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: serving ? 0.97 : 1 }}
        transition={SETTLE}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateZ: [-1.6, 1.6, -1.6] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
        <motion.div
          className="relative aspect-square w-full"
          style={{ transform: plate, transformStyle: "preserve-3d" }}
        >
          {/* rim */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(145deg, #FFFDF7 0%, #EFE6D2 55%, #DCCFB4 100%)",
              boxShadow: "0 0 0 2px #E7DFCC inset, 0 14px 34px rgba(84,62,33,0.22)",
              transform: "translateZ(-14px)",
            }}
          />

          {/* the five katoris */}
          {modules.map((m, i) => {
            const raised = serving === m.id ? 60 : hover === m.id ? 24 : 0;
            return (
              <motion.div
                key={m.id}
                className="pointer-events-none absolute inset-0"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ z: raised }}
                transition={LIFT}
              >
                <svg viewBox={`0 0 ${S} ${S}`} className="h-full w-full overflow-visible">
                  <path
                    d={wedgePath(C, C, R, i * 72, i * 72 + 72)}
                    fill={m.fill}
                    stroke="#FBF7EE"
                    strokeWidth="3"
                    opacity={hover && hover !== m.id && !serving ? 0.62 : 1}
                    style={{
                      pointerEvents: "auto",
                      cursor: "pointer",
                      transition: "opacity .25s ease",
                      filter:
                        raised > 0
                          ? "drop-shadow(10px 16px 14px rgba(84,62,33,0.34))"
                          : "drop-shadow(2px 4px 5px rgba(84,62,33,0.18))",
                    }}
                    onPointerEnter={() => setHover(m.id)}
                    onClick={() => choose(m.id)}
                  />
                </svg>
              </motion.div>
            );
          })}

          {/* labels, counter-rotated so the type never skews */}
          {modules.map((m, i) => {
            const p = polarToCartesian(C, C, R * 0.63, i * 72 + 36);
            const raised = serving === m.id ? 60 : hover === m.id ? 24 : 0;
            return (
              <motion.div
                key={`${m.id}-label`}
                className="pointer-events-none absolute"
                style={{
                  left: `${(p.x / S) * 100}%`,
                  top: `${(p.y / S) * 100}%`,
                  transformStyle: "preserve-3d",
                }}
                animate={{ z: raised + 4 }}
                transition={LIFT}
              >
                {/* Centring stays in plain CSS on its own node; the counter-
                    rotation then pivots around a point that sits exactly on
                    the anchor, so the type reads flat while the plate leans. */}
                <div
                  className="-translate-x-1/2 -translate-y-1/2"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div style={{ transform: faceMe }}>
                    <p className="whitespace-nowrap font-display text-[15px] font-semibold leading-none text-orange-50">
                      {m.label}
                    </p>
                    <p className="mt-1 whitespace-nowrap text-[10px] leading-none text-orange-50/85">
                      {m.sub}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}

          {/* the hub */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ z: 16 }}
            transition={LIFT}
          >
            <div
              className="-translate-x-1/2 -translate-y-1/2"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="flex h-[76px] w-[76px] items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(150deg,#FFFDF7 0%,#F1E8D6 100%)",
                  boxShadow: "0 0 0 2px #E7DFCC inset, 6px 10px 16px rgba(84,62,33,0.28)",
                }}
              >
                <motion.div className="text-center" style={{ transform: faceMe }}>
                  <p className="text-[10px] leading-tight text-stone-500">one plate,</p>
                  <p className="text-[10px] leading-tight text-stone-500">every habit</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
