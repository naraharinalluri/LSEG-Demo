import { Component, computed, inject, signal } from '@angular/core';
import { RESEARCH_ITEMS } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-research-panel',
  standalone: true,
  imports: [PanelComponent, ClientPickerComponent],
  template: `
    <app-panel title="RESEARCH" [scroll]="true" [right]="true">
      <div panelRight class="flex items-center gap-2">
        <select
          [value]="tickerFilter()"
          (change)="onTickerChange($event)"
          class="bg-halo-elevated border border-halo-border text-halo-text text-2xs px-1.5 py-0.5 focus:outline-none focus:border-halo-accent"
        >
          @for (sym of tickerOptions(); track sym) {
            <option [value]="sym">{{ sym || 'ALL TICKERS' }}</option>
          }
        </select>
        <app-client-picker [value]="clientId()" (valueChange)="clientId.set($event)" />
      </div>
      <ul class="divide-y divide-halo-border/30">
        @for (r of filtered(); track r.id) {
          <li class="px-2.5 py-1.5">
            <div class="flex items-baseline gap-2">
              <span class="text-2xs font-bold tracking-wider text-halo-muted">LSEG</span>
              @if (r.tag) {
                <span
                  class="text-2xs font-semibold px-1 py-0 rounded bg-halo-muted/20 text-halo-muted tracking-wider"
                >
                  {{ r.tag }}
                </span>
              }
              <span class="ml-auto text-2xs text-halo-dim num">{{ r.pages }}p</span>
            </div>
            <div class="text-xs text-halo-text mt-0.5 leading-snug">{{ r.title }}</div>
            @if (r.tickers.length > 0) {
              <div class="text-2xs text-halo-muted num mt-0.5">{{ r.tickers.join(' · ') }}</div>
            }
          </li>
        }
      </ul>
    </app-panel>
  `,
})
export class ResearchPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly tickerFilter = signal('');

  tickerOptions = computed(() => {
    const cs = this.state().clients[this.clientId()];
    const symbols = new Set<string>();
    if (cs) for (const h of cs.holdings) symbols.add(h.symbol);
    return ['', ...Array.from(symbols)];
  });

  filtered = computed(() => {
    const cs = this.state().clients[this.clientId()];
    const ticker = this.tickerFilter();
    return RESEARCH_ITEMS.filter((r) => {
      if (ticker) return (r.tickers as readonly string[]).includes(ticker);
      if (r.tickers.length === 0) return true;
      if (!cs) return true;
      return r.tickers.some((t) => cs.holdings.some((h) => h.symbol === t));
    });
  });

  onTickerChange(event: Event): void {
    this.tickerFilter.set((event.target as HTMLSelectElement).value);
  }
}
