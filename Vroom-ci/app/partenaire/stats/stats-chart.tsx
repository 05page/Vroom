"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

const chartData = [
    { mois: "Jan", vues: 1200, conversion: 3.2, rdv: 2 },
    { mois: "Fév", vues: 1450, conversion: 3.5, rdv: 6},
    { mois: "Mar", vues: 1380, conversion: 3.1, rdv: 2},
    { mois: "Avr", vues: 1620, conversion: 4.0, rdv: 4},
    { mois: "Mai", vues: 1890, conversion: 4.3, rdv: 5},
    { mois: "Juin", vues: 2100, conversion: 4.8, rdv: 2},
    { mois: "Juil", vues: 2450, conversion: 5.1, rdv: 7},
    { mois: "Août", vues: 2200, conversion: 4.6, rdv: 3},
    { mois: "Sep", vues: 1950, conversion: 4.2, rdv: 8},
    { mois: "Oct", vues: 2300, conversion: 4.7, rdv: 1},
    { mois: "Nov", vues: 2680, conversion: 5.0, rdv: 2},
    { mois: "Déc", vues: 3956, conversion: 4.2, rdv: 0},
]

const chartConfig = {
    vues: {
        label: "Vues",
        color: "#3b82f6",
    },
    conversion: {
        label: "Taux de conversion (%)",
        color: "#14b8a6",
    },
    rdv: {
        label:"Rendez-Vous",
        color: "red"
    }
} satisfies ChartConfig

type ChartMode = "vues" | "conversion" | "rdv" | "les-trois"

export function StatsChart() {
    const [mode, setMode] = useState<ChartMode>("les-trois")

    return (
        <Card className="rounded-2xl shadow-sm border border-border/40">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold text-black">
                            Performances mensuelles
                        </CardTitle>
                        <p className="text-xs text-black/60 mt-0.5">
                            Évolution sur les 12 derniers mois.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                        {([
                            { value: "vues", label: "Vues" },
                            { value: "conversion", label: "Conversion" },
                            { value: "rdv", label: "Rendez-Vous" },
                            { value: "les-trois", label: "Les trois" },
                        ] as const).map((item) => (
                            <Button
                                key={item.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => setMode(item.value)}
                                className={`h-7 text-xs px-3 cursor-pointer rounded-md ${
                                    mode === item.value
                                        ? "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:text-white"
                                        : "text-black/60 hover:text-black"
                                }`}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
                    <ComposedChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="mois"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fontSize: 12 }}
                        />
                        {(mode === "vues" || mode === "les-trois") && (
                            <YAxis
                                yAxisId="vues"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tick={{ fontSize: 11 }}
                                width={45}
                            />
                        )}
                        {(mode === "conversion" || mode === "les-trois") && (
                            <YAxis
                                yAxisId="conversion"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `${v}%`}
                                width={45}
                            />
                        )}
                        {(mode === "rdv" || mode === "les-trois") && (
                            <YAxis
                                yAxisId="rdv"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tick={{ fontSize: 11 }}
                                width={45}
                            />
                        )}
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value, name) => {
                                        if (name === "conversion") return `${value}%`
                                        return value.toLocaleString()
                                    }}
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        {(mode === "vues" || mode === "les-trois") && (
                            <Bar
                                yAxisId="vues"
                                dataKey="vues"
                                fill="var(--color-vues)"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            />
                        )}
                        {(mode === "conversion" || mode === "les-trois") && (
                            <Line
                                yAxisId="conversion"
                                type="monotone"
                                dataKey="conversion"
                                stroke="var(--color-conversion)"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "var(--color-conversion)", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {(mode === "rdv" || mode === "les-trois") && (
                            <Line
                                yAxisId="rdv"
                                type="monotone"
                                dataKey="rdv"
                                stroke="var(--color-conversion)"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "var(--color-conversion)", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
