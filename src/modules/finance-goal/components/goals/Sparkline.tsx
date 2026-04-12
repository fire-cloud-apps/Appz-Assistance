import { useMemo, useState, useRef, useEffect } from 'react'
import type { YearlyProjection } from '../../domain/services/FinancialProjectionService'

interface SparklineProps {
  data: YearlyProjection[]
  width?: number
  height?: number
  goalId?: string
  startYear?: string
  endYear?: string
  showArea?: boolean
  showTooltip?: boolean
}

const MANTINE_COLORS = [
  'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'red', 'pink', 'purple', 'grape', 'indigo'
]

const MANTINE_COLOR_MAP: Record<string, { start: string; end: string; main: string }> = {
  blue:    { start: '#3b82f6', end: '#93c5fd', main: '#228be6' },
  cyan:    { start: '#06b6d4', end: '#67e8f9', main: '#22b8cf' },
  teal:    { start: '#14b8a6', end: '#5eead4', main: '#12b886' },
  green:   { start: '#22c55e', end: '#86efac', main: '#40c057' },
  lime:    { start: '#84cc16', end: '#bef264', main: '#94d82d' },
  yellow:  { start: '#eab308', end: '#fde047', main: '#fab005' },
  orange:  { start: '#f97316', end: '#fdba74', main: '#fd7d14' },
  red:     { start: '#ef4444', end: '#fca5a5', main: '#fa5252' },
  pink:    { start: '#ec4899', end: '#f9a8d4', main: '#e64980' },
  purple:  { start: '#a855f7', end: '#d8b4fe', main: '#be4bdb' },
  grape:   { start: '#8b5cf6', end: '#c4b5fd', main: '#9c36b5' },
  indigo:  { start: '#6366f1', end: '#a5b4fc', main: '#5c7cfa' },
}

function getRandomColorFromString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % MANTINE_COLORS.length
  return MANTINE_COLORS[index]
}

function stepCurve(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  
  for (let i = 1; i < points.length; i++) {
    const curr = points[i]
    path += ` V ${curr.y.toFixed(2)} H ${curr.x.toFixed(2)}`
  }
  
  return path
}

export function Sparkline({
  data,
  width: propWidth,
  height = 56,
  goalId = '',
  startYear = '',
  endYear = '',
  showArea = true,
  showTooltip = true,
}: SparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: propWidth || 240, height })
  
  useEffect(() => {
    if (containerRef.current && !propWidth) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setDimensions(prev => ({
            ...prev,
            width: Math.max(entry.contentRect.width, 100),
          }))
        }
      })
      resizeObserver.observe(containerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [propWidth])

  const width = propWidth || dimensions.width
  
  const colorKey = useMemo(() => getRandomColorFromString(goalId || Math.random().toString()), [goalId])
  const colorScheme = MANTINE_COLOR_MAP[colorKey] || MANTINE_COLOR_MAP.blue

  const sparklineWidth = width - 100

  const { linePath, areaPath, points, normalizedData, summaryData } = useMemo(() => {
    if (!data.length || data.length < 2) {
      return { linePath: '', areaPath: '', points: [], normalizedData: [], summaryData: null }
    }

    const values = data.map(d => d.totalFutureValue)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1

    const padding = 4
    const effectiveWidth = sparklineWidth - padding * 2
    const effectiveHeight = height - padding * 2

    const pts = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * effectiveWidth,
      y: padding + effectiveHeight - ((d.totalFutureValue - min) / range) * effectiveHeight,
    }))

    const line = stepCurve(pts)

    const area = pts.length > 0
      ? line + ` L ${pts[pts.length - 1].x.toFixed(2)} ${height - padding} L ${padding} ${height - padding} Z`
      : ''

    const normData = data.map((d, i) => ({
      ...d,
      x: pts[i]?.x ?? 0,
      y: pts[i]?.y ?? 0,
    }))
    
    const firstValue = data[0]?.totalFutureValue ?? 0
    const lastValue = data[data.length - 1]?.totalFutureValue ?? 0
    const growth = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0
    
    let midValue = lastValue
    let midYear = data[data.length - 1]?.yearLabel || ''
    if (data.length >= 3) {
      const midIndex = Math.floor(data.length / 2)
      midValue = data[midIndex]?.totalFutureValue ?? lastValue
      midYear = data[midIndex]?.yearLabel || ''
    }
    
    const summary = {
      startValue: firstValue,
      midValue: midValue,
      midYear: midYear,
      finalValue: lastValue,
      growth: growth,
      years: data.length,
    }

    return { linePath: line, areaPath: area, points: pts, normalizedData: normData, summaryData: summary }
  }, [data, sparklineWidth, height])

  if (!data.length || data.length < 2) {
    return (
      <svg width={width} height={height}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="gray" fontSize="10">
          No data
        </text>
      </svg>
    )
  }

  const formatCompact = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
    return `₹${value.toFixed(0)}`
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', width: '100%', height, gap: 8 }}>
      <div style={{ position: 'relative', flex: 1, minWidth: 0, height }}>
        <svg width="100%" height={height} style={{ display: 'block' }} viewBox={`0 0 ${sparklineWidth} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`spark-grad-${goalId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorScheme.start} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colorScheme.end} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          {showArea && areaPath && (
            <path 
              d={areaPath} 
              fill={`url(#spark-grad-${goalId})`}
            />
          )}
          
          <path
            d={linePath}
            fill="none"
            stroke={colorScheme.start}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? 5 : 3}
              fill="#ffffff"
              stroke={colorScheme.start}
              strokeWidth={2}
              opacity={hoveredIndex !== null && hoveredIndex !== index ? 0.4 : 1}
              style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
        
        {showTooltip && hoveredIndex !== null && normalizedData[hoveredIndex] && (
          <div
            style={{
              position: 'absolute',
              left: normalizedData[hoveredIndex].x,
              top: normalizedData[hoveredIndex].y - 36,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontWeight: 600 }}>{normalizedData[hoveredIndex].yearLabel}</div>
            <div>{formatCompact(normalizedData[hoveredIndex].totalFutureValue)}</div>
          </div>
        )}
      </div>

      {summaryData && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          height: '100%',
          padding: '4px 0',
          minWidth: 80,
          paddingLeft: 8,
          borderLeft: `2px solid ${colorScheme.end}`,
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 9, color: 'var(--mantine-color-gray-5)', textTransform: 'uppercase' }}>
              Start
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--mantine-color-gray-7)' }}>
              {formatCompact(summaryData.startValue)}
            </div>
          </div>
          
          {summaryData.midYear && (
            <div>
              <div style={{ fontSize: 9, color: 'var(--mantine-color-gray-5)', textTransform: 'uppercase' }}>
                {startYear && endYear ? `${startYear.slice(2)} - ${endYear.slice(2)}` : summaryData.midYear}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: colorScheme.main }}>
                {formatCompact(summaryData.midValue)}
              </div>
            </div>
          )}
          
          <div>
            <div style={{ fontSize: 9, color: 'var(--mantine-color-gray-5)', textTransform: 'uppercase' }}>
              Final
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: colorScheme.main, lineHeight: 1.2 }}>
              {formatCompact(summaryData.finalValue)}
            </div>
            <div style={{ 
              fontSize: 10, 
              color: summaryData.growth >= 0 ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-red-6)',
              fontWeight: 600,
            }}>
              {summaryData.growth >= 0 ? '+' : ''}{summaryData.growth.toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}