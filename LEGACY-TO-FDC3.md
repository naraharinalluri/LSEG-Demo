# Wealth Desktop: Legacy vs FDC3


| | Legacy (`wealth-legacy-angular/`) | FDC3 (`wealth-fdc3-react/`) |
|---|---|---|
| **Stack** | Angular 19, no interop layer | React 18 + FDC3 2.2 prototype agent |
| **Client selection** | Each panel has its own dropdown | One click in Client Book retunes all panels |
| **Holding selection** | Ticker dropdown per panel (Research, News, Holdings) | One click broadcasts `fdc3.instrument` |
| **Schedule Call** | Not wired across panels | `StartCall` intent — any panel can raise it, one handler opens the modal |
| **Coupling** | 9 independent dropdowns | Panels opt in via `addContextListener` — no imports between panels |

**The UI and data are identical. Only the wiring changed.**

---

## 1. Selecting a client

### Before — Angular, siloed state

Client Book only highlights a row locally. It does **not** tell other panels.

```typescript
// wealth-legacy-angular — Client Book
selectedId = signal('C001');

selectClient(id: string) {
  this.selectedId.set(id);  // local only — nothing else updates
}
```

Every other panel keeps its **own** client picker:

```html
<!-- wealth-legacy-angular — Client Summary -->
<app-client-picker [value]="clientId()" (valueChange)="clientId.set($event)" />
```

Same pattern in Holdings, Performance, Activity, Research, and News. Switching client = **6 separate dropdown changes**.

### After — React + FDC3, one broadcast

Client Book **broadcasts** standard contact context. Listeners update automatically.

```typescript
// wealth-fdc3-react — Client Book (source)
agent.broadcast({
  type: 'fdc3.contact',
  id: { FDS_ID: client.id, email: `${client.id.toLowerCase()}@wealth.example.com` },
  name: client.name,
});
```

```typescript
// wealth-fdc3-react — Client Summary (listener)
const contact = useContactContext();  // addContextListener('fdc3.contact', …)
const clientId = contact?.id.FDS_ID ?? CLIENTS[0].id;
```

No dropdown. No import of Client Book. **One click → six panels retune.**

---

## 2. Selecting a holding (second context type)

### Before

Holdings, Research, and News each have a **ticker `<select>`** tied to that panel only. Client Summary does not know you picked NVDA.

### After

Holdings broadcasts instrument context. Research and News listen for **both** `fdc3.contact` and `fdc3.instrument` and combine filters. Client Summary ignores instrument — it only listens for contact.

```typescript
// wealth-fdc3-react — Holdings (source)
agent.broadcast({ type: 'fdc3.instrument', id: { ticker: symbol }, name });

// wealth-fdc3-react — Research (listener — contact + instrument)
const contact = useContactContext();
const instrument = useInstrumentContext();
// filter research by client holdings AND optional ticker
```

Two context types on one channel, neither stomping the other.

---

## 3. Schedule Call (intent, not a direct import)

### Before

No cross-panel action. Modals would require each panel to know about a shared UI component.

### After

Any panel raises a **standard FDC3 intent**. The desktop shell is the only handler.

```typescript
// Client Book or Activity — raise intent
agent.raiseIntent('StartCall', {
  type: 'fdc3.contact',
  id: { FDS_ID: client.id },
  name: client.name,
});

// Desktop shell — register handler once
agent.addIntentListener('StartCall', async (ctx) => {
  openScheduleCallModal(ctx);
});
```

Client Book does not import the modal. Activity can trigger the same flow. Swap the mock window for Teams/Symphony in production — panel code unchanged.

---

## 4. What FDC3 replaces (conceptually)

| Legacy pattern | FDC3 primitive | API |
|---|---|---|
| Per-panel `<select>` for client | Context broadcast | `fdc3.broadcast({ type: 'fdc3.contact', … })` |
| Panel reads shared client | Context listener | `fdc3.addContextListener('fdc3.contact', cb)` |
| Per-panel ticker filter | Second context type | `fdc3.broadcast({ type: 'fdc3.instrument', … })` |
| Right-click → Schedule Call | Intent | `fdc3.raiseIntent('StartCall', ctx)` |
| Floating modal | Intent handler | `fdc3.addIntentListener('StartCall', cb)` |
| Coloured workspace dots | User channels | `fdc3.joinUserChannel('fdc3.channel.3')` |

