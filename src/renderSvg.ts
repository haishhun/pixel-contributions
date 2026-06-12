import { ContributionData, ContributionDay, getLevelIndex } from "./fetchContributions.js";

export type RenderOptions = {
  colorScheme?: "github-dark" | "dracula" | "nord" | "synthwave";
  cellSize?: number;
  cellGap?: number;
  cellRadius?: number;
  showTotal?: boolean;
  showMonths?: boolean;
  showDays?: boolean;
  compress?: boolean;
  title?: string;
  quote?: string;
};

type ColorScheme = {
  bg: string;
  border: string;
  text: string;
  subtext: string;
  levels: [string, string, string, string, string];
  accent: string;
  titleGlow: string;
};

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  "github-dark": {
    bg: "#0d1117",
    border: "#30363d",
    text: "#e6edf3",
    subtext: "#7d8590",
    levels: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    accent: "#39d353",
    titleGlow: "#39d353",
  },
  dracula: {
    bg: "#282a36",
    border: "#44475a",
    text: "#f8f8f2",
    subtext: "#6272a4",
    levels: ["#44475a", "#3d1f6e", "#6133a4", "#8f5fd7", "#bd93f9"],
    accent: "#bd93f9",
    titleGlow: "#bd93f9",
  },
  nord: {
    bg: "#2e3440",
    border: "#3b4252",
    text: "#eceff4",
    subtext: "#4c566a",
    levels: ["#3b4252", "#1f3a4f", "#1d5c7a", "#2e86ab", "#88c0d0"],
    accent: "#88c0d0",
    titleGlow: "#88c0d0",
  },
  synthwave: {
    bg: "#1a1a2e",
    border: "#16213e",
    text: "#eaeaea",
    subtext: "#a0a0c0",
    levels: ["#16213e", "#4a0e5e", "#7b2d8b", "#c724b1", "#ff2d9d"],
    accent: "#ff2d9d",
    titleGlow: "#ff2d9d",
  },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const QUOTES = [
  "Every commit brings me closer to my goals.",
  "Code is poetry written in logic.",
  "Ship it. Improve it. Repeat.",
  "Great software is built one commit at a time.",
  "Keep pushing. Keep shipping.",
];

export function renderSvg(data: ContributionData, opts: RenderOptions = {}): string {
  const {
    colorScheme = "github-dark",
    cellSize = 11,
    cellGap = 3,
    cellRadius = 2,
    showTotal = true,
    showMonths = true,
    showDays = true,
    compress = false,
    title = "CONTRIBUTIONS",
    quote = QUOTES[Math.floor(Math.random() * QUOTES.length)],
  } = opts;

  const colors = COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES["github-dark"];
  const step = cellSize + cellGap;

  // Compress: merge every pair of consecutive weeks into one cell column
  // Each compressed cell = sum of counts, max of levels
  type CompressedDay = { dayOfWeek: number; count: number; level: 0 | 1 | 2 | 3 | 4; dates: string };
  type CompressedWeek = { days: CompressedDay[]; firstDate: string };

  const rawWeeks = data.weeks;

  const displayWeeks: CompressedWeek[] = compress
    ? (() => {
      const result: CompressedWeek[] = [];
      for (let i = 0; i < rawWeeks.length; i += 2) {
        const weekA = rawWeeks[i];
        const weekB = rawWeeks[i + 1];
        // Collect all days from both weeks, group by day-of-week
        const byDow = new Map<number, { count: number; level: 0 | 1 | 2 | 3 | 4; dates: string[] }>();
        for (const week of [weekA, weekB].filter(Boolean)) {
          for (const day of week.contributionDays) {
            const dow = new Date(day.date).getDay();
            const existing = byDow.get(dow);
            const lvl = getLevelIndex(day.contributionLevel);
            if (existing) {
              existing.count += day.contributionCount;
              existing.level = Math.max(existing.level, lvl) as 0 | 1 | 2 | 3 | 4;
              existing.dates.push(day.date);
            } else {
              byDow.set(dow, { count: day.contributionCount, level: lvl, dates: [day.date] });
            }
          }
        }
        result.push({
          firstDate: weekA?.contributionDays[0]?.date ?? "",
          days: Array.from(byDow.entries()).map(([dow, d]) => ({
            dayOfWeek: dow,
            count: d.count,
            level: d.level,
            dates: d.dates.join(" &amp; "),
          })),
        });
      }
      return result;
    })()
    : rawWeeks.map((w) => ({
      firstDate: w.contributionDays[0]?.date ?? "",
      days: w.contributionDays.map((d) => ({
        dayOfWeek: new Date(d.date).getDay(),
        count: d.contributionCount,
        level: getLevelIndex(d.contributionLevel),
        dates: d.date,
      })),
    }));

  const paddingLeft = showDays ? 32 : 10;
  const paddingTop = showMonths ? 40 : 20;
  const paddingRight = 16;
  const paddingBottom = showTotal ? 56 : 20;

  const titleHeight = 30;
  const totalPaddingTop = paddingTop + titleHeight;

  const numWeeks = displayWeeks.length;

  const gridWidth = numWeeks * step - cellGap;
  const gridHeight = 7 * step - cellGap;

  const svgWidth = paddingLeft + gridWidth + paddingRight;
  const svgHeight = totalPaddingTop + gridHeight + paddingBottom;

  // Build month labels
  let monthLabels = "";
  if (showMonths) {
    let lastMonth = -1;
    displayWeeks.forEach((week, wi) => {
      if (!week.firstDate) return;
      const month = new Date(week.firstDate + "T12:00:00").getMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        const x = paddingLeft + wi * step;
        monthLabels += `<text x="${x}" y="${totalPaddingTop - 6}" fill="${colors.subtext}" font-size="9" font-family="monospace">${MONTHS[month]}</text>`;
      }
    });
  }

  // Build day labels
  let dayLabels = "";
  if (showDays) {
    [1, 3, 5].forEach((dayIndex) => {
      const y = totalPaddingTop + dayIndex * step + cellSize - 1;
      dayLabels += `<text x="${paddingLeft - 4}" y="${y}" fill="${colors.subtext}" font-size="9" font-family="monospace" text-anchor="end">${DAYS[dayIndex]}</text>`;
    });
  }

  // Build cells
  let cells = "";
  displayWeeks.forEach((week, wi) => {
    week.days.forEach((day) => {
      const x = paddingLeft + wi * step;
      const y = totalPaddingTop + day.dayOfWeek * step;
      const fill = colors.levels[day.level];
      const label = `${day.dates}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`;
      cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${cellRadius}" ry="${cellRadius}" fill="${fill}"><title>${label}</title></rect>`;
    });
  });

  // Bottom bar
  const bottomY = totalPaddingTop + gridHeight + 18;
  const quoteText = showTotal
    ? `<text x="${paddingLeft}" y="${bottomY}" fill="${colors.subtext}" font-size="9" font-family="monospace">${quote}</text>
       <text x="${svgWidth - paddingRight}" y="${bottomY}" fill="${colors.accent}" font-size="9" font-family="monospace" text-anchor="end">Keep going! ♥</text>
       <text x="${paddingLeft}" y="${bottomY + 16}" fill="${colors.subtext}" font-size="9" font-family="monospace">${data.totalContributions.toLocaleString()} contributions in the last year</text>`
    : "";

  return `<svg
  width="${svgWidth}"
  height="${svgHeight}"
  viewBox="0 0 ${svgWidth} ${svgHeight}"
  xmlns="http://www.w3.org/2000/svg"
>
  <style>
    text { dominant-baseline: auto; }
  </style>

  <!-- Background -->
  <rect width="${svgWidth}" height="${svgHeight}" rx="8" ry="8" fill="${colors.bg}" />
  <rect width="${svgWidth}" height="${svgHeight}" rx="8" ry="8" fill="none" stroke="${colors.border}" stroke-width="1" />

  <!-- Title -->
  <text
    x="${paddingLeft}"
    y="22"
    fill="${colors.accent}"
    font-size="13"
    font-family="monospace"
    font-weight="bold"
    letter-spacing="2"
    filter="url(#glow)"
  >🔥 ${title}</text>

  <!-- Glow filter -->
  <defs>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Month labels -->
  ${monthLabels}

  <!-- Day labels -->
  ${dayLabels}

  <!-- Contribution cells -->
  ${cells}

  <!-- Bottom bar -->
  ${quoteText}
</svg>`;
}