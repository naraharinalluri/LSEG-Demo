import { Component, computed, inject, signal } from '@angular/core';
import { NEWS_SOURCE_COLORS } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatRelativeTime } from '../../utils/format';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-news-panel',
  standalone: true,
  imports: [PanelComponent, ClientPickerComponent],
  template: `
    <app-panel title="NEWS" [scroll]="true" [right]="true">
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
        @for (n of filtered(); track n.id) {
          <li class="px-2.5 py-1.5">
            <div class="flex items-baseline gap-2">
              <span
                class="text-2xs font-bold tracking-wider"
                [style.color]="sourceColor(n.source)"
              >
                {{ n.source }}
              </span>
              @if (n.tag) {
                <span
                  class="text-2xs font-semibold px-1 py-0 rounded bg-halo-muted/20 text-halo-muted tracking-wider"
                >
                  {{ n.tag }}
                </span>
              }
              <span class="ml-auto text-2xs text-halo-dim num">
                {{ n.time >= 0 ? 'now' : formatRelativeTime(n.time) }}
              </span>
            </div>
            <div class="text-xs text-halo-text mt-0.5 leading-snug">{{ n.headline }}</div>
            @if (n.tickers.length > 0) {
              <div class="text-2xs text-halo-muted num mt-0.5">{{ n.tickers.join(' · ') }}</div>
            }
          </li>
        }
      </ul>
    </app-panel>
  `,
})
export class NewsPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly tickerFilter = signal('');
  protected readonly sourceColors = NEWS_SOURCE_COLORS;
  protected readonly formatRelativeTime = formatRelativeTime;

  tickerOptions = computed(() => {
    const cs = this.state().clients[this.clientId()];
    const symbols = new Set<string>();
    if (cs) for (const h of cs.holdings) symbols.add(h.symbol);
    return ['', ...Array.from(symbols)];
  });

  filtered = computed(() => {
    const cs = this.state().clients[this.clientId()];
    const ticker = this.tickerFilter();
    return this.state().news.filter((n) => {
      if (ticker) return n.tickers.includes(ticker);
      if (n.tickers.length === 0) return true;
      if (!cs) return true;
      return n.tickers.some((t) => cs.holdings.some((h) => h.symbol === t));
    });
  });

  onTickerChange(event: Event): void {
    this.tickerFilter.set((event.target as HTMLSelectElement).value);
  }

  sourceColor(source: string): string {
    return this.sourceColors[source as keyof typeof this.sourceColors] ?? '#8b95a7';
  }
}
