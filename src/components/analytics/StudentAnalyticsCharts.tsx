import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SubjectPerformanceProps {
    subjects: { name: string; average: number; color: string }[];
}

export const SubjectPerformanceGauges: React.FC<SubjectPerformanceProps> = ({ subjects }) => {
    const getGaugeColor = (percentage: number) => {
        if (percentage >= 80) return '#10b981'; // green
        if (percentage >= 60) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subjects.map((subject, index) => (
                <Card key={index} className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">{subject.name} Avg Grade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-32 h-32 mx-auto">
                            {/* Circular gauge */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={getGaugeColor(subject.average)}
                                    strokeWidth="8"
                                    strokeDasharray={`${(subject.average / 100) * 251.2} 251.2`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold" style={{ color: getGaugeColor(subject.average) }}>
                                        {subject.average.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">0.00 - 100.00</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

interface GradeDistributionProps {
    data: { grade: string; count: number; percentage: number; color: string }[];
}

export const GradeDistributionChart: React.FC<GradeDistributionProps> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;

    const createArc = (startAngle: number, endAngle: number) => {
        const start = polarToCartesian(50, 50, 40, endAngle);
        const end = polarToCartesian(50, 50, 40, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
    };

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians)
        };
    };

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle>Students by Grade</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            {data.map((item, index) => {
                                const angle = (item.percentage / 100) * 360;
                                const arc = createArc(currentAngle, currentAngle + angle);
                                currentAngle += angle;
                                return (
                                    <path
                                        key={index}
                                        d={arc}
                                        fill={item.color}
                                        opacity="0.8"
                                    />
                                );
                            })}
                            {/* Center hole */}
                            <circle cx="50" cy="50" r="25" fill="white" />
                        </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span>{item.grade}</span>
                                </div>
                                <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

interface SubjectYearPerformanceProps {
    data: {
        year: string;
        subjects: { name: string; value: number; color: string }[];
    }[];
}

export const SubjectYearPerformanceChart: React.FC<SubjectYearPerformanceProps> = ({ data }) => {
    const maxValue = Math.max(...data.flatMap(d => d.subjects.map(s => s.value)));
    const subjects = data[0]?.subjects.map(s => s.name) || [];

    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle>Average Grade by Year and Subject</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Legend */}
                    <div className="flex gap-4 justify-end flex-wrap">
                        {subjects.map((subject, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: data[0].subjects[index].color }}
                                />
                                <span>{subject}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stacked Bar Chart */}
                    <div className="space-y-3">
                        {data.map((yearData, yearIndex) => (
                            <div key={yearIndex} className="flex items-center gap-3">
                                <div className="w-24 text-sm font-medium">{yearData.year}</div>
                                <div className="flex-1 h-8 flex rounded overflow-hidden border border-border">
                                    {yearData.subjects.map((subject, subIndex) => (
                                        <div
                                            key={subIndex}
                                            className="flex items-center justify-center text-xs font-medium text-white"
                                            style={{
                                                backgroundColor: subject.color,
                                                width: `${(subject.value / maxValue) * 100}%`,
                                                minWidth: subject.value > 0 ? '40px' : '0'
                                            }}
                                        >
                                            {subject.value > 0 && subject.value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* X-axis */}
                    <div className="flex justify-between text-xs text-muted-foreground pl-28">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                        <span>150</span>
                        <span>200</span>
                        <span>250</span>
                        <span>300</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
