import { Component, inject, signal } from '@angular/core';
import { ALLOC_COLORS, ALLOC_LABELS } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatPct } from '../../utils/format';
import type { AssetClass } from '../../types';
import { AllocationDonutComponent } from '../allocation-donut/allocation-donut.component';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';
import { PerformanceChartComponent } from '../performance-chart/performance-chart.component';

@Component({
  selector: 'app-performance-panel',
  standalone: true,
  imports: [
    PanelComponent,
    ClientPickerComponent,
    PerformanceChartComponent,
    AllocationDonutComponent,
  ],
  template: `
    @if (clientState(); as cs) {
      <app-panel title="PERFORMANCE · ALLOCATION" [right]="true">
        <app-client-picker panelRight [value]="clientId()" (valueChange)="clientId.set($event)" />
        <div class="flex flex-1 min-h-0">
          <div class="flex flex-col" style="flex: 1.5 1 0; min-width: 0">
            <div
              class="flex items-baseline justify-between px-3 pt-2 pb-1 border-b border-halo-border/30"
            >
              <div class="text-2xs text-halo-dim uppercase tracking-wider">12-month performance</div>
              <div class="text-2xs num text-halo-muted">
                {{ formatPct(cs.totalReturnPct, 1) }} vs {{ formatPct(cs.benchmarkReturnPct, 1) }} bench
              </div>
            </div>
            <div class="relative flex-1 min-h-0">
              <div class="absolute inset-1">
                <app-performance-chart [data]="cs.performanceSeries" />
              </div>
            </div>
          </div>
          <div
            class="flex flex-col border-l border-halo-border/40"
            style="flex: 1 1 0; min-width: 0"
          >
            <div
              class="text-2xs text-halo-dim uppercase tracking-wider px-3 pt-2 pb-1 border-b border-halo-border/30"
            >
              Allocation
            </div>
            <div class="flex flex-1 items-center gap-3 px-3 py-2 min-h-0">
              <app-allocation-donut [entries]="allocEntries(cs)" />
              <div class="flex flex-col gap-1 min-w-0">
                @for (e of allocEntries(cs); track e.key) {
                  <div class="flex items-center gap-2 text-2xs">
                    <span
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      [style.background]="allocColors[e.key]"
                    ></span>
                    <span class="text-halo-muted truncate">{{ allocLabels[e.key] }}</span>
                    <span class="num text-halo-text ml-auto">{{ (e.value * 100).toFixed(1) }}%</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </app-panel>
    } @else {
      <app-panel title="PERFORMANCE · ALLOCATION"><div></div></app-panel>
    }
  `,
})
export class PerformancePanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly formatPct = formatPct;
  protected readonly allocColors = ALLOC_COLORS;
  protected readonly allocLabels = ALLOC_LABELS;

  clientState() {
    return this.state().clients[this.clientId()];
  }

  allocEntries(cs: NonNullable<ReturnType<typeof this.clientState>>) {
    return (Object.keys(cs.allocation) as AssetClass[])
      .map((key) => ({ key, value: cs.allocation[key] }))
      .filter((e) => e.value > 0.001);
  }
}
