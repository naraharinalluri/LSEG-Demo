import { FDC3_CHANNELS } from '../data/wealth-data';
import type { Fdc3Context } from '../types';

interface ContextListener {
  channelId: string;
  contextType: string | null;
  handler: (ctx: Fdc3Context) => void;
}

interface IntentListener {
  intent: string;
  handler: (ctx: Fdc3Context) => void | Promise<void>;
}

export class PrototypeFdc3Agent {
  currentChannelId = 'fdc3.channel.1';
  private contextListeners = new Set<ContextListener>();
  private intentListeners = new Map<string, Set<IntentListener>>();
  private channelContext = new Map<string, Map<string, Fdc3Context>>();

  async getUserChannels() {
    return FDC3_CHANNELS;
  }

  async joinUserChannel(channelId: string) {
    if (!FDC3_CHANNELS.find((c) => c.id === channelId)) {
      throw new Error(`Unknown channel: ${channelId}`);
    }
    this.currentChannelId = channelId;
    const ctxMap = this.channelContext.get(channelId);
    if (ctxMap) {
      for (const ctx of ctxMap.values()) {
        this.deliverContext(ctx, channelId);
      }
    }
  }

  async leaveCurrentChannel() {}

  async getCurrentChannel() {
    return FDC3_CHANNELS.find((c) => c.id === this.currentChannelId) ?? null;
  }

  async broadcast(context: Fdc3Context) {
    let map = this.channelContext.get(this.currentChannelId);
    if (!map) {
      map = new Map();
      this.channelContext.set(this.currentChannelId, map);
    }
    map.set(context.type, context);
    this.deliverContext(context, this.currentChannelId);
  }

  async addContextListener(
    contextTypeOrHandler: string | ((ctx: Fdc3Context) => void),
    handler?: (ctx: Fdc3Context) => void,
  ) {
    let contextType: string | null = null;
    let h: (ctx: Fdc3Context) => void;
    if (typeof contextTypeOrHandler === 'function') {
      h = contextTypeOrHandler;
    } else {
      contextType = contextTypeOrHandler;
      h = handler!;
    }
    const entry: ContextListener = {
      channelId: this.currentChannelId,
      contextType,
      handler: h,
    };
    this.contextListeners.add(entry);
    return {
      unsubscribe: () => this.contextListeners.delete(entry),
    };
  }

  private deliverContext(context: Fdc3Context, channelId: string) {
    for (const l of this.contextListeners) {
      if (l.channelId === channelId && (!l.contextType || l.contextType === context.type)) {
        try {
          l.handler(context);
        } catch (e) {
          console.error('FDC3 context listener error', e);
        }
      }
    }
  }

  async addIntentListener(intent: string, handler: (ctx: Fdc3Context) => void | Promise<void>) {
    if (!this.intentListeners.has(intent)) {
      this.intentListeners.set(intent, new Set());
    }
    const set = this.intentListeners.get(intent)!;
    const entry: IntentListener = { intent, handler };
    set.add(entry);
    return { unsubscribe: () => set.delete(entry) };
  }

  async raiseIntent(intent: string, context: Fdc3Context) {
    const set = this.intentListeners.get(intent);
    if (!set || set.size === 0) {
      throw new Error(`No handler registered for intent: ${intent}`);
    }
    const first = set.values().next().value!;
    return first.handler(context);
  }
}

let agentInstance: PrototypeFdc3Agent | null = null;

export function installFdc3Agent(): PrototypeFdc3Agent {
  if (!agentInstance) {
    agentInstance = new PrototypeFdc3Agent();
    (window as Window & { fdc3?: PrototypeFdc3Agent }).fdc3 = agentInstance;
  }
  return agentInstance;
}

export function getFdc3Agent(): PrototypeFdc3Agent {
  if (!agentInstance) throw new Error('FDC3 agent not installed');
  return agentInstance;
}
