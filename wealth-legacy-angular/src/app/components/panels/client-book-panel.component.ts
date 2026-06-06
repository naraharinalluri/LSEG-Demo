import { Component, inject, signal } from '@angular/core';
import { CLIENTS, RISK_STYLES } from '../../data/wealth-data';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatAum } from '../../utils/format';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-client-book-panel',
  standalone: true,
  imports: [PanelComponent],
  template: `
    <app-panel title="CLIENT BOOK" [scroll]="true" [right]="true">
      <span panelRight class="text-2xs text-halo-dim italic">No broadcast</span>
      <table class="w-full text-xs">
        <thead class="sticky top-0 bg-halo-panel z-10">
          <tr class="text-halo-dim uppercase text-2xs tracking-wider">
            <th class="text-left font-medium px-2 py-2">Client</th>
            <th class="text-right font-medium px-1 py-2">AUM</th>
            <th class="text-center font-medium px-2 py-2">Risk</th>
          </tr>
        </thead>
        <tbody>
          @for (client of clients; track client.id) {
            @let cs = state().clients[client.id];
            @let risk = riskStyles[client.risk];
            @let selected = selectedId() === client.id;
            <tr
              (click)="selectClient(client.id)"
              [class]="
                'cursor-pointer border-b border-halo-border/40 ' +
                (selected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]')
              "
            >
              <td class="px-2 py-2">
                <div class="text-halo-text font-medium leading-snug">{{ client.name }}</div>
                <div class="text-2xs text-halo-dim">{{ client.segment }}</div>
              </td>
              <td class="text-right px-1 py-2 num text-halo-text">
                {{ cs ? formatAum(cs.totalMv) : '—' }}
              </td>
              <td class="text-center px-2 py-2">
                <span
                  class="text-2xs font-bold tracking-wider rounded px-1 py-0.5"
                  [style.background]="risk.bg"
                  [style.color]="risk.color"
                >
                  {{ client.risk }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-panel>
  `,
})
export class ClientBookPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clients = CLIENTS;
  protected readonly riskStyles = RISK_STYLES;
  protected readonly formatAum = formatAum;
  protected readonly selectedId = signal('C001');

  selectClient(id: string): void {
    this.selectedId.set(id);
  }
}
