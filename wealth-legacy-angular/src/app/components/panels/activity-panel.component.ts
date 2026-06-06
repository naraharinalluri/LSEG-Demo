import { Component, computed, inject, signal } from '@angular/core';
import { ACTIVITY_TYPE_COLORS } from '../../data/constants';
import { WealthDriverService } from '../../services/wealth-driver.service';
import { formatRelativeTime } from '../../utils/format';
import { ClientPickerComponent } from '../client-picker/client-picker.component';
import { PanelComponent } from '../panel/panel.component';

@Component({
  selector: 'app-activity-panel',
  standalone: true,
  imports: [PanelComponent, ClientPickerComponent],
  template: `
    <app-panel title="ACTIVITY" [scroll]="true" [right]="true">
      <app-client-picker panelRight [value]="clientId()" (valueChange)="clientId.set($event)" />
      <ul class="divide-y divide-halo-border/30">
        @for (item of items(); track item.id) {
          <li class="px-2.5 py-1.5">
            <div class="flex items-baseline gap-2">
              <span
                class="text-2xs font-bold tracking-wider"
                [style.color]="typeColors[item.type]"
              >
                {{ item.type }}
              </span>
              <span class="text-2xs text-halo-dim num ml-auto">{{
                formatRelativeTime(item.time)
              }}</span>
            </div>
            <div class="text-xs text-halo-text mt-0.5 leading-snug">{{ item.headline }}</div>
            @if (item.detail) {
              <div class="text-2xs text-halo-muted leading-snug mt-0.5">{{ item.detail }}</div>
            }
          </li>
        }
      </ul>
    </app-panel>
  `,
})
export class ActivityPanelComponent {
  private readonly driver = inject(WealthDriverService);

  protected readonly state = this.driver.stateSignal;
  protected readonly clientId = signal('C001');
  protected readonly typeColors = ACTIVITY_TYPE_COLORS;
  protected readonly formatRelativeTime = formatRelativeTime;

  items = computed(() =>
    this.state()
      .activity.filter((a) => a.clientId === this.clientId())
      .sort((a, b) => b.time - a.time),
  );
}
