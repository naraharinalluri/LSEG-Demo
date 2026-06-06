import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header
      class="flex items-center justify-between px-3 py-2 border-b border-halo-border bg-halo-panel/80 backdrop-blur flex-shrink-0"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div
            class="w-5 h-5 rounded-sm flex items-center justify-center font-bold text-halo-bg"
            style="background: #fa6400"
          >
            W
          </div>
          <span class="text-sm font-semibold tracking-tight">Wealth Manager Desktop</span>
          <span class="text-2xs text-halo-dim uppercase tracking-wider hidden md:inline">
            Prototype · FDC3 2.2
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden lg:flex items-center text-2xs uppercase tracking-wider">
          <span class="text-halo-dim">
            <span class="mr-1.5">●</span> Apps operate independently
          </span>
        </div>
        <div class="inline-flex border border-halo-border rounded overflow-hidden">
          <span class="px-3 py-1 text-2xs font-semibold tracking-wider bg-halo-elevated text-halo-text">
            LEGACY · ANGULAR
          </span>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {}
