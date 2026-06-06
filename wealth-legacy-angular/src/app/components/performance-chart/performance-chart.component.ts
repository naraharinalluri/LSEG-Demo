import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import type { PerformancePoint } from '../../types';

@Component({
  selector: 'app-performance-chart',
  standalone: true,
  template: `
    <div #container class="w-full h-full">
      <svg [attr.width]="width" [attr.height]="height" class="block">
        @if (data().length > 0) {
          <!-- grid lines -->
          @for (tick of yTicks; track tick) {
            <line
              [attr.x1]="padL"
              [attr.x2]="width - padR"
              [attr.y1]="yScale(tick)"
              [attr.y2]="yScale(tick)"
              stroke="rgba(255,255,255,0.04)"
            />
            <text
              [attr.x]="width - padR + 4"
              [attr.y]="yScale(tick) + 3"
              fill="#8b95a7"
              font-size="9"
              font-family="JetBrains Mono, monospace"
            >
              {{ formatTick(tick) }}
            </text>
          }
          <!-- benchmark line -->
          <polyline
            [attr.points]="benchmarkPoints"
            fill="none"
            stroke="#5c6473"
            stroke-width="1"
            stroke-dasharray="3 3"
          />
          <!-- portfolio area -->
          <polygon [attr.points]="areaPoints" fill="rgba(139,149,167,0.15)" />
          <polyline
            [attr.points]="portfolioPoints"
            fill="none"
            stroke="#8b95a7"
            stroke-width="1.5"
          />
        }
      </svg>
    </div>
  `,
})
export class PerformanceChartComponent implements AfterViewInit {
  readonly data = input.required<PerformancePoint[]>();

  private readonly container = viewChild<ElementRef<HTMLDivElement>>('container');

  protected width = 400;
  protected height = 200;
  protected readonly padL = 0;
  protected readonly padR = 38;
  protected readonly padT = 8;
  protected readonly padB = 4;

  protected yTicks: number[] = [];
  protected portfolioPoints = '';
  protected benchmarkPoints = '';
  protected areaPoints = '';

  constructor() {
    effect(() => {
      this.data();
      this.rebuild();
    });
  }

  ngAfterViewInit(): void {
    const el = this.container()?.nativeElement;
    if (!el) return;
    const ro = new ResizeObserver(() => this.rebuild());
    ro.observe(el);
    this.rebuild();
  }

  private rebuild(): void {
    const el = this.container()?.nativeElement;
    if (el) {
      this.width = el.clientWidth || 400;
      this.height = el.clientHeight || 200;
    }
    const pts = this.data();
    if (!pts.length) return;

    const values = pts.flatMap((p) => [p.portfolio, p.benchmark]);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const range = max - min || 1;

    const chartW = this.width - this.padL - this.padR;
    const chartH = this.height - this.padT - this.padB;

    const xScale = (i: number) => this.padL + (i / (pts.length - 1)) * chartW;
    this.yScale = (v: number) => this.padT + chartH - ((v - min) / range) * chartH;

    this.yTicks = [min, min + range * 0.5, max];

    this.portfolioPoints = pts.map((p, i) => `${xScale(i)},${this.yScale(p.portfolio)}`).join(' ');
    this.benchmarkPoints = pts.map((p, i) => `${xScale(i)},${this.yScale(p.benchmark)}`).join(' ');

    const baseY = this.padT + chartH;
    const firstX = xScale(0);
    const lastX = xScale(pts.length - 1);
    this.areaPoints =
      `${firstX},${baseY} ` +
      pts.map((p, i) => `${xScale(i)},${this.yScale(p.portfolio)}`).join(' ') +
      ` ${lastX},${baseY}`;
  }

  protected yScale = (_v: number) => 0;

  protected formatTick(v: number): string {
    return `${(v - 100).toFixed(0)}%`;
  }
}
