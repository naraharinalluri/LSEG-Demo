import { Component, input } from '@angular/core';
import { ALLOC_COLORS } from '../../data/wealth-data';
import type { AssetClass } from '../../types';

interface Entry {
  key: AssetClass;
  value: number;
}

@Component({
  selector: 'app-allocation-donut',
  standalone: true,
  template: `
    <svg width="84" height="84" viewBox="0 0 84 84" style="flex-shrink: 0">
      <circle cx="42" cy="42" [attr.r]="r" fill="none" stroke="#1c212c" stroke-width="14" />
      @for (entry of entries(); track entry.key) {
        <circle
          cx="42"
          cy="42"
          [attr.r]="r"
          fill="none"
          [attr.stroke]="colors[entry.key]"
          stroke-width="14"
          [attr.stroke-dasharray]="dashArray(entry)"
          [attr.stroke-dashoffset]="dashOffset(entry)"
          transform="rotate(-90 42 42)"
        />
      }
    </svg>
  `,
})
export class AllocationDonutComponent {
  readonly entries = input.required<Entry[]>();

  protected readonly r = 35;
  protected readonly colors = ALLOC_COLORS;
  private readonly circumference = 2 * Math.PI * 35;

  private getOffsetBefore(key: AssetClass): number {
    let offset = 0;
    for (const e of this.entries()) {
      if (e.key === key) break;
      offset += e.value;
    }
    return offset;
  }

  dashArray(entry: Entry): string {
    const dash = entry.value * this.circumference;
    return `${dash} ${this.circumference - dash}`;
  }

  dashOffset(entry: Entry): number {
    return -this.getOffsetBefore(entry.key) * this.circumference;
  }
}
