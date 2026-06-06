import { Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: true,
  template: `
    <div class="panel" [class.pulse]="pulse()">
      <div class="panel-chrome">
        <div class="flex items-center gap-2 min-w-0">
          <span class="panel-header truncate">{{ title() }}</span>
        </div>
        @if (right()) {
          <div class="flex items-center gap-2 flex-shrink-0">
            <ng-content select="[panelRight]" />
          </div>
        }
      </div>
      <div class="panel-body" [class.overflow-auto]="scroll()">
        <ng-content />
      </div>
    </div>
  `,
})
export class PanelComponent {
  readonly title = input.required<string>();
  readonly scroll = input(false);
  readonly pulse = input(false);
  readonly right = input(false);
}
