import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, type IChartApi } from 'lightweight-charts';
import type { Candle } from '../types';
import { useTheme } from '../context/ThemeContext';
import { money } from '../services/format';

type TF = '1D' | '1W' | '1M' | '3M' | '1Y';
const TF_DAYS: Record<TF, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function PriceChart({ candles, up, currency = 'INR' }: { candles: Candle[]; up: boolean; currency?: string }) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [tf, setTf] = useState<TF>('1M');
  const [mode, setMode] = useState<'area' | 'candles'>('area');

  // Slice the available history to the chosen timeframe (client-side).
  const sliced = candles.slice(Math.max(0, candles.length - TF_DAYS[tf]));

  useEffect(() => {
    const el = containerRef.current;
    const tip = tooltipRef.current;
    if (!el || sliced.length === 0) return;

    const green = cssVar('--green') || '#16c784';
    const red = cssVar('--red') || '#ea3943';
    const accent = up ? green : red;

    const chart = createChart(el, {
      layout: { background: { type: ColorType.Solid, color: cssVar('--chart-bg') }, textColor: cssVar('--chart-text') },
      grid: { vertLines: { color: cssVar('--chart-grid') }, horzLines: { color: cssVar('--chart-grid') } },
      width: el.clientWidth,
      height: 340,
      timeScale: { timeVisible: false, borderColor: cssVar('--chart-grid') },
      rightPriceScale: { borderColor: cssVar('--chart-grid') },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;

    let series: any;
    if (mode === 'candles') {
      series = chart.addCandlestickSeries({
        upColor: green, downColor: red, borderVisible: false, wickUpColor: green, wickDownColor: red,
      });
      series.setData(sliced.map((c) => ({ time: c.date, open: c.open, high: c.high, low: c.low, close: c.close })) as any);
    } else {
      series = chart.addAreaSeries({
        lineColor: accent, topColor: accent + '55', bottomColor: accent + '05', lineWidth: 2,
      });
      series.setData(sliced.map((c) => ({ time: c.date, value: c.close })) as any);
    }
    chart.timeScale().fitContent();

    // Custom tooltip: show date + price on hover.
    const onMove = (param: any) => {
      if (!tip) return;
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0) {
        tip.style.display = 'none';
        return;
      }
      const d = series ? param.seriesData.get(series) : undefined;
      if (!d) { tip.style.display = 'none'; return; }
      const close = d.value !== undefined ? d.value : d.close;
      tip.style.display = 'block';
      tip.innerHTML = `<div class="tt-date">${param.time}</div><div class="tt-price">${money(close, currency)}</div>`;
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let x = param.point.x + 16;
      if (x + w > el.clientWidth) x = param.point.x - w - 16;
      let y = param.point.y - h - 10;
      if (y < 0) y = param.point.y + 16;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    };
    chart.subscribeCrosshairMove(onMove);

    const ro = new ResizeObserver(() => chart.applyOptions({ width: el.clientWidth }));
    ro.observe(el);

    return () => { ro.disconnect(); chart.unsubscribeCrosshairMove(onMove); chart.remove(); chartRef.current = null; };
  }, [sliced, mode, theme, up, currency]);

  return (
    <div>
      <div className="chart-toolbar">
        <div className="tf-pills">
          {(Object.keys(TF_DAYS) as TF[]).map((t) => (
            <button key={t} className={`tf-pill ${tf === t ? 'active' : ''}`} onClick={() => setTf(t)}>{t}</button>
          ))}
        </div>
        <div className="tf-pills">
          <button className={`tf-pill ${mode === 'area' ? 'active' : ''}`} onClick={() => setMode('area')}>Line</button>
          <button className={`tf-pill ${mode === 'candles' ? 'active' : ''}`} onClick={() => setMode('candles')}>Candles</button>
        </div>
      </div>
      {sliced.length > 0
        ? <div style={{ position: 'relative' }}>
            <div ref={containerRef} />
            <div ref={tooltipRef} className="chart-tooltip" style={{ display: 'none' }} />
          </div>
        : <p style={{ color: 'var(--text-dim)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
            Candle data builds as the market runs. Check back shortly.
          </p>}
    </div>
  );
}
