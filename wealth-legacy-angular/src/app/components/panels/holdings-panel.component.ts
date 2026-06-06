import { Component, computed, inject, signal } from '@angular/core';
import { ALLOC_LABELS, CLIENTS, INSTRUMENT_DEFS } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatMoney, formatPct } from '../../utils/format';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-holdings-panel',
  standalone: true,
  imports: [PanelComponent, ClientPickerComponent],
  template: `
    @if (clientState(); as cs) {
      <app-panel title="PORTFOLIO HOLDINGS" [scroll]="true" [right]="true">
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
        <table class="w-full text-xs">
          <thead class="sticky top-0 bg-halo-panel z-10">
            <tr class="text-halo-dim uppercase text-2xs tracking-wider">
              <th class="text-left font-medium px-2 py-1.5">Symbol</th>
              <th class="text-left font-medium px-1 py-1.5">Name</th>
              <th class="text-left font-medium px-1 py-1.5">Class</th>
              <th class="text-right font-medium px-1 py-1.5">Qty</th>
              <th class="text-right font-medium px-1 py-1.5">Price</th>
              <th class="text-right font-medium px-1 py-1.5">Mkt Value</th>
              <th class="text-right font-medium px-1 py-1.5">Wgt %</th>
              <th class="text-right font-medium px-1 py-1.5">Day Chg</th>
              <th class="text-right font-medium px-2 py-1.5">Unr P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.symbol) {
              @let isCash = row.assetClass === 'CASH';
              <tr class="border-b border-halo-border/30">
                <td class="px-2 py-1 num text-halo-text font-medium">{{ row.symbol }}</td>
                <td class="px-1 py-1 leading-tight">{{ row.name }}</td>
                <td class="px-1 py-1 text-halo-muted text-2xs">
                  {{ allocLabels[row.assetClass] }}
                </td>
                <td class="px-1 py-1 text-right num">
                  {{ isCash ? '—' : row.qty.toLocaleString('en-US') }}
                </td>
                <td class="px-1 py-1 text-right num">
                  {{ isCash ? '1.0000' : row.price.toFixed(2) }}
                </td>
                <td class="px-1 py-1 text-right num text-halo-text">{{ formatMoney(row.mv) }}</td>
                <td class="px-1 py-1 text-right num">{{ row.weight.toFixed(1) }}%</td>
                <td
                  class="px-1 py-1 text-right num"
                  [class.text-halo-dim]="isCash"
                  [class.text-halo-up]="!isCash && row.dayChg >= 0"
                  [class.text-halo-down]="!isCash && row.dayChg < 0"
                >
                  {{ isCash ? '—' : formatPct(row.dayChg) }}
                </td>
                <td
                  class="px-2 py-1 text-right num"
                  [class.text-halo-dim]="isCash"
                  [class.text-halo-up]="!isCash && row.unrPnl >= 0"
                  [class.text-halo-down]="!isCash && row.unrPnl < 0"
                >
                  {{
                    isCash ? '—' : (row.unrPnl >= 0 ? '+' : '') + formatMoney(row.unrPnl)
                  }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </app-panel>
    } @else {
      <app-panel title="PORTFOLIO HOLDINGS" [scroll]="true"><div></div></app-panel>
    }
  `,
})
export class HoldingsPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly tickerFilter = signal('');
  protected readonly formatMoney = formatMoney;
  protected readonly formatPct = formatPct;
  protected readonly allocLabels = ALLOC_LABELS;

  clientState() {
    return this.state().clients[this.clientId()];
  }

  tickerOptions = computed(() => {
    const cs = this.clientState();
    if (!cs) return [''];
    return ['', ...cs.holdings.map((h) => h.symbol)];
  });

  rows = computed(() => {
    const cs = this.clientState();
    const filter = this.tickerFilter();
    const st = this.state();
    if (!cs) return [];
    return cs.holdings
      .filter((h) => !filter || h.symbol === filter)
      .map((h) => {
        const inst = st.instruments[h.symbol];
        const def = INSTRUMENT_DEFS[h.symbol as keyof typeof INSTRUMENT_DEFS];
        const price = inst?.price ?? 0;
        const mv = h.qty * price;
        const weight = cs.totalMv > 0 ? (mv / cs.totalMv) * 100 : 0;
        const dayChg = inst ? ((inst.price - inst.startPrice) / inst.startPrice) * 100 : 0;
        const unrPnl = inst && def ? h.qty * (inst.price - inst.costBasis) : 0;
        return {
          symbol: h.symbol,
          name: inst?.name ?? h.symbol,
          assetClass: inst?.assetClass ?? ('CASH' as const),
          qty: h.qty,
          price,
          mv,
          weight,
          dayChg,
          unrPnl,
        };
      });
  });

  onTickerChange(event: Event): void {
    this.tickerFilter.set((event.target as HTMLSelectElement).value);
  }
}
