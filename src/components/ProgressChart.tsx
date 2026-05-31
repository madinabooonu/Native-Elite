import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════
   PROGRESS CHARTS
   ═══════════════════════════════════════════ */

type TimeRange = 'weekly' | 'monthly';

interface ProgressData {
    speaking: number[];
    vocabulary: number[];
    mockTest: number[];
    attendance: number[];
}

const WEEKLY_DATA: ProgressData = {
    speaking: [5.5, 6.0, 5.5, 6.5, 6.0, 7.0, 6.5],
    vocabulary: [12, 18, 15, 22, 20, 25, 28],
    mockTest: [5.0, 5.5, 6.0, 5.5, 6.5, 6.0, 6.5],
    attendance: [1, 1, 0, 1, 1, 1, 0],
};

const MONTHLY_DATA: ProgressData = {
    speaking: [5.0, 5.5, 5.5, 6.0, 6.0, 6.5, 6.5, 7.0, 6.5, 7.0, 7.0, 7.5],
    vocabulary: [40, 55, 68, 82, 95, 110, 125, 140, 155, 170, 188, 205],
    mockTest: [5.0, 5.0, 5.5, 5.5, 6.0, 6.0, 6.0, 6.5, 6.5, 6.5, 7.0, 7.0],
    attendance: [8, 10, 9, 11, 10, 12, 11, 12, 10, 11, 12, 11],
};

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Mini Bar Chart ── */
const BarChart = ({ data, labels, color, maxVal, suffix = '' }: {
    data: number[];
    labels: string[];
    color: string;
    maxVal: number;
    suffix?: string;
}) => {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="relative">
            <div className="flex items-end justify-between gap-1 h-32 px-1">
                {data.map((val, i) => {
                    const height = Math.max((val / maxVal) * 100, 4);
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 relative"
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        >
                            {hoveredIdx === i && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-7 bg-brand-navy text-[#0a1628] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10 whitespace-nowrap"
                                >
                                    {val}{suffix}
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 0.6, delay: i * 0.05 }}
                                className={cn('w-full rounded-t-md min-h-[3px]', color)}
                                style={{ maxHeight: '100%' }}
                            />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2 px-1">
                {labels.map((l, i) => (
                    <span key={i} className="text-[9px] text-gray-500 text-center flex-1">{l}</span>
                ))}
            </div>
        </div>
    );
};

/* ── Line Chart (SVG) ── */
const LineChart = ({ data, labels, color, maxVal, suffix = '' }: {
    data: number[];
    labels: string[];
    color: string;
    maxVal: number;
    suffix?: string;
}) => {
    const width = 300;
    const height = 120;
    const padding = 10;
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * chartW;
        const y = padding + chartH - (val / maxVal) * chartH;
        return { x, y, val };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '120px' }}>
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color === 'emerald' ? '#34d399' : color === 'purple' ? '#a78bfa' : color === 'amber' ? '#fbbf24' : '#60a5fa'} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color === 'emerald' ? '#34d399' : color === 'purple' ? '#a78bfa' : color === 'amber' ? '#fbbf24' : '#60a5fa'} stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#grad-${color})`} />
                <path d={pathD} fill="none" stroke={color === 'emerald' ? '#34d399' : color === 'purple' ? '#a78bfa' : color === 'amber' ? '#fbbf24' : '#60a5fa'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIdx === i ? 5 : 3}
                        fill={color === 'emerald' ? '#34d399' : color === 'purple' ? '#a78bfa' : color === 'amber' ? '#fbbf24' : '#60a5fa'}
                        stroke="#0a1628"
                        strokeWidth="2"
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    />
                ))}
            </svg>
            {hoveredIdx !== null && (
                <div
                    className="absolute bg-brand-navy text-[#0a1628] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg z-10"
                    style={{
                        left: `${(points[hoveredIdx].x / width) * 100}%`,
                        top: `${(points[hoveredIdx].y / height) * 100 - 15}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {points[hoveredIdx].val}{suffix}
                </div>
            )}
            <div className="flex justify-between mt-1 px-1">
                {labels.map((l, i) => (
                    <span key={i} className="text-[9px] text-gray-500 text-center" style={{ flex: 1 }}>{l}</span>
                ))}
            </div>
        </div>
    );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, change, icon, color }: {
    label: string;
    value: string;
    change: string;
    icon: string;
    color: string;
}) => (
    <div className={cn('p-4 rounded-xl border', color)}>
        <div className="flex items-center justify-between mb-2">
            <span className="text-lg">{icon}</span>
            <span className="text-[10px] font-bold text-brand-blue-light">
                {change}
            </span>
        </div>
        <p className="text-xl font-black text-white">{value}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
    </div>
);

/* ═══════════════════════════════════════════
   MAIN PROGRESS COMPONENT
   ═══════════════════════════════════════════ */
export const ProgressChart = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
    const data = timeRange === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;
    const labels = timeRange === 'weekly' ? WEEK_LABELS : MONTH_LABELS;

    const avgSpeaking = (data.speaking.reduce((a, b) => a + b, 0) / data.speaking.length).toFixed(1);
    const totalVocab = data.vocabulary[data.vocabulary.length - 1];
    const latestMock = data.mockTest[data.mockTest.length - 1].toFixed(1);
    const attendanceRate = timeRange === 'weekly'
        ? Math.round((data.attendance.filter(a => a > 0).length / data.attendance.length) * 100)
        : Math.round((data.attendance.reduce((a, b) => a + b, 0) / (data.attendance.length * 12)) * 100);

    return (
        <div className="min-h-screen bg-[#0a1628] text-white pb-24">
            {/* Header */}
            <div className="px-4 pt-6 pb-3">
                <h2 className="text-xl font-black text-white mb-1">My Progress</h2>
                <p className="text-gray-500 text-xs">Track your learning journey</p>
            </div>

            {/* Time Range Toggle */}
            <div className="flex gap-2 px-4 mb-5">
                {(['weekly', 'monthly'] as const).map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all',
                            timeRange === range
                                ? 'bg-brand-blue-light/10 border-brand-blue-light/40 text-brand-blue-light'
                                : 'border-gray-700/40 text-gray-600 hover:border-gray-600'
                        )}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 px-4 mb-6">
                <StatCard
                    icon="🎤" label="Speaking Avg" value={avgSpeaking}
                    change={`↑ Band ${avgSpeaking}`} color="bg-[#0d1f38] border-purple-400/20"
                />
                <StatCard
                    icon="📚" label="Words Learned" value={String(totalVocab)}
                    change={`+${timeRange === 'weekly' ? 28 : 205} words`} color="bg-[#0d1f38] border-brand-blue-light/20"
                />
                <StatCard
                    icon="📝" label="Mock Test" value={latestMock}
                    change={`Band ${latestMock}`} color="bg-[#0d1f38] border-amber-400/20"
                />
                <StatCard
                    icon="✅" label="Attendance" value={`${attendanceRate}%`}
                    change={attendanceRate >= 80 ? 'Excellent' : 'Good'} color="bg-[#0d1f38] border-blue-400/20"
                />
            </div>

            {/* Speaking Progress */}
            <div className="px-4 mb-5">
                <div className="bg-[#0d1f38] rounded-2xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-bold text-white">Speaking Progress</p>
                            <p className="text-[10px] text-gray-500">IELTS Band Score</p>
                        </div>
                        <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">🎤 Band {avgSpeaking}</span>
                    </div>
                    <LineChart
                        data={data.speaking}
                        labels={labels}
                        color="purple"
                        maxVal={9}
                        suffix=""
                    />
                </div>
            </div>

            {/* Vocabulary Growth */}
            <div className="px-4 mb-5">
                <div className="bg-[#0d1f38] rounded-2xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-bold text-white">Vocabulary Growth</p>
                            <p className="text-[10px] text-gray-500">Words learned over time</p>
                        </div>
                        <span className="text-xs font-bold text-brand-blue-light bg-brand-blue-light/10 px-2 py-0.5 rounded">📚 {totalVocab}</span>
                    </div>
                    <BarChart
                        data={data.vocabulary}
                        labels={labels}
                        color="bg-brand-blue-light"
                        maxVal={Math.max(...data.vocabulary) * 1.2}
                        suffix=" words"
                    />
                </div>
            </div>

            {/* Mock Test Results */}
            <div className="px-4 mb-5">
                <div className="bg-[#0d1f38] rounded-2xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-bold text-white">Mock Test Results</p>
                            <p className="text-[10px] text-gray-500">Overall band scores</p>
                        </div>
                        <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">📝 Band {latestMock}</span>
                    </div>
                    <LineChart
                        data={data.mockTest}
                        labels={labels}
                        color="amber"
                        maxVal={9}
                    />
                </div>
            </div>

            {/* Attendance */}
            <div className="px-4 mb-5">
                <div className="bg-[#0d1f38] rounded-2xl p-4 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-bold text-white">Attendance</p>
                            <p className="text-[10px] text-gray-500">{timeRange === 'weekly' ? 'Classes attended this week' : 'Monthly attendance'}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">✅ {attendanceRate}%</span>
                    </div>
                    <BarChart
                        data={data.attendance}
                        labels={labels}
                        color="bg-blue-400"
                        maxVal={timeRange === 'weekly' ? 1.2 : Math.max(...data.attendance) * 1.2}
                        suffix={timeRange === 'weekly' ? '' : ' classes'}
                    />
                </div>
            </div>
        </div>
    );
};
