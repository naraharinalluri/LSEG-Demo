import { Component, inject, signal } from '@angular/core';
import { CLIENTS, RISK_STYLES } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatAum, formatMoney, formatPct, formatReviewDate } from '../../utils/format';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-client-summary-panel',
  standalone: true,
  imports: [PanelComponent, ClientPickerComponent],
  template: `
    @if (clientState(); as cs) {
      <app-panel title="CLIENT SUMMARY" [right]="true">
        <app-client-picker panelRight [value]="clientId()" (valueChange)="clientId.set($event)" />
        <div class="px-3 py-2 grid gap-3" style="grid-template-columns: 1.4fr 1fr 1fr 1fr 1fr">
          <div>
            <div class="text-2xs text-halo-dim uppercase tracking-wider mb-1">Household</div>
            <div class="text-halo-text font-medium text-sm leading-snug">{{ client()!.name }}</div>
            <div class="text-halo-muted text-2xs mt-0.5 leading-snug">{{ client()!.household }}</div>
          </div>
          <div>
            <div class="text-2xs text-halo-dim uppercase tracking-wider mb-1">Total AUM</div>
            <div class="num text-halo-text font-semibold text-base">{{ formatAum(cs.totalMv) }}</div>
            <div
              class="text-2xs num mt-0.5"
              [class.text-halo-up]="cs.dayPnl >= 0"
              [class.text-halo-down]="cs.dayPnl < 0"
            >
              {{ cs.dayPnl >= 0 ? '▲' : '▼' }} {{ formatMoney(Math.abs(cs.dayPnl)) }} ({{
                formatPct(cs.dayPnlPct)
              }})
            </div>
          </div>
          <div>
            <div class="text-2xs text-halo-dim uppercase tracking-wider mb-1">Mandate · Risk</div>
            <div class="text-halo-text text-xs">{{ client()!.mandate }}</div>
            <div class="mt-1">
              <span
                class="text-2xs font-bold tracking-wider rounded px-1.5 py-0.5"
                [style.background]="riskStyle.bg"
                [style.color]="riskStyle.color"
              >
                {{ riskStyle.label }}
              </span>
            </div>
          </div>
          <div>
            <div class="text-2xs text-halo-dim uppercase tracking-wider mb-1">Drift vs IPS</div>
            <div class="text-xs text-halo-muted">
              Equity {{ cs.equityDrift >= 0 ? '+' : '' }}{{ cs.equityDrift.toFixed(1) }}% vs target
            </div>
          </div>
          <div>
            <div class="text-2xs text-halo-dim uppercase tracking-wider mb-1">RM · Next Review</div>
            <div class="text-halo-text text-xs">{{ client()!.rm }}</div>
            <div class="text-2xs text-halo-muted mt-0.5">
              Due {{ formatReviewDate(client()!.nextReview) }}
            </div>
          </div>
        </div>
      </app-panel>
    } @else {
      <app-panel title="CLIENT SUMMARY"><div></div></app-panel>
    }
  `,
})
export class ClientSummaryPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly formatAum = formatAum;
  protected readonly formatMoney = formatMoney;
  protected readonly formatPct = formatPct;
  protected readonly formatReviewDate = formatReviewDate;
  protected readonly Math = Math;

  client() {
    return CLIENTS.find((c) => c.id === this.clientId()) ?? CLIENTS[0];
  }

  clientState() {
    return this.state().clients[this.clientId()];
  }

  get riskStyle() {
    return RISK_STYLES[this.client()!.risk];
  }
}
