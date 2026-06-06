import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ActivityPanelComponent } from './components/panels/activity-panel.component';
import { ClientBookPanelComponent } from './components/panels/client-book-panel.component';
import { ClientSummaryPanelComponent } from './components/panels/client-summary-panel.component';
import { HoldingsPanelComponent } from './components/panels/holdings-panel.component';
import { NewsPanelComponent } from './components/panels/news-panel.component';
import { PerformancePanelComponent } from './components/panels/performance-panel.component';
import { ResearchPanelComponent } from './components/panels/research-panel.component';
import { WealthDriverService } from './services/wealth-driver.service';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    ClientBookPanelComponent,
    ClientSummaryPanelComponent,
    HoldingsPanelComponent,
    PerformancePanelComponent,
    ActivityPanelComponent,
    ResearchPanelComponent,
    NewsPanelComponent,
  ],
  templateUrl: './app.html',
  host: { class: 'h-full flex flex-col' },
})
export class App implements OnInit, OnDestroy {
  private readonly driver = inject(WealthDriverService);

  ngOnInit(): void {
    this.driver.start();
  }

  ngOnDestroy(): void {
    this.driver.stop();
  }
}
