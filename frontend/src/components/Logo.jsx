// SkillSprint brand logo (icon + wordmark). Usage: <Logo size={40} /> or <Logo iconOnly />
export const LogoIcon = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-label="SkillSprint">
    <defs>
      <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0b1030" /><stop offset="1" stopColor="#1a1250" />
      </linearGradient>
      <linearGradient id="ss-rim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="ss-b1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#38bdf8" /><stop offset="1" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="ss-b2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#6366f1" /><stop offset="1" stopColor="#c084fc" />
      </linearGradient>
    </defs>
    <rect x="3" y="3" width="58" height="58" rx="16" fill="url(#ss-bg)" stroke="url(#ss-rim)" strokeWidth="2.5" />
    <path d="M38 12 C41 11 43 13 41 16 L25 30 C23 32 25 33 27 32 L33 29 C31 32 29 33 27 35 L22 34 C19 33 19 31 21 29 Z" fill="url(#ss-b1)" />
    <path d="M42 29 C46 28 48 31 45 33 L28 48 C25 51 22 52 23 50 L33 38 C35 36 33 35 31 36 L26 38 C30 35 36 31 42 29 Z" fill="url(#ss-b2)" />
  </svg>
);

const Logo = ({ size = 40, iconOnly = false, textClass = 'text-xl' }) => (
  <span className="flex items-center gap-3 group">
    <span className="relative inline-flex">
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-500 blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
      <LogoIcon size={size} className="relative" />
    </span>
    {!iconOnly && (
      <span className={`${textClass} font-bold font-display tracking-tight`}>
        <span className="text-white">Skill</span>
        <span className="brand-text">Sprint</span>
      </span>
    )}
  </span>
);

export default Logo;
