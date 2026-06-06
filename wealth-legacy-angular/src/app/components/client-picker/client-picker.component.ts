import { Component, input, output } from '@angular/core';
import { CLIENTS } from '../../data/wealth-data';

@Component({
  selector: 'app-client-picker',
  standalone: true,
  template: `
    <select
      [value]="value()"
      (change)="onChange($event)"
      class="bg-halo-elevated border border-halo-border text-halo-text text-2xs px-1.5 py-0.5 focus:outline-none focus:border-halo-accent max-w-[160px]"
    >
      @for (client of clients; track client.id) {
        <option [value]="client.id">{{ client.name }}</option>
      }
    </select>
  `,
})
export class ClientPickerComponent {
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  protected readonly clients = CLIENTS;

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(select.value);
  }
}
