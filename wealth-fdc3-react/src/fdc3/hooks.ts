import { useEffect, useMemo, useState } from 'react';
import { FDC3_CHANNELS } from '../data/wealth-data';
import { getFdc3Agent } from './agent';
import type { Fdc3ContactContext, Fdc3Context, Fdc3InstrumentContext } from '../types';

export function useFdc3Agent() {
  const [agent] = useState(() => getFdc3Agent());
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    agent.getCurrentChannel().then((ch) => {
      if (!cancelled) setCurrentChannel(ch?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [agent]);

  const channelColor = useMemo(() => {
    return FDC3_CHANNELS.find((c) => c.id === currentChannel)?.displayMetadata.color;
  }, [currentChannel]);

  const joinChannel = async (id: string) => {
    await agent.joinUserChannel(id);
    setCurrentChannel(id);
  };

  return { agent, currentChannel, channelColor, joinChannel };
}

export function useContactContext() {
  const [ctx, setCtx] = useState<Fdc3ContactContext | null>(null);
  useEffect(() => {
    const agent = getFdc3Agent();
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    agent
      .addContextListener('fdc3.contact', (c) => {
        if (!cancelled) setCtx(c as Fdc3ContactContext);
      })
      .then((s) => {
        if (cancelled) s.unsubscribe();
        else sub = s;
      });
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);
  return ctx;
}

export function useInstrumentContext() {
  const [ctx, setCtx] = useState<Fdc3InstrumentContext | null>(null);
  useEffect(() => {
    const agent = getFdc3Agent();
    let sub: { unsubscribe: () => void } | null = null;
    let cancelled = false;
    agent
      .addContextListener('fdc3.instrument', (c) => {
        if (!cancelled) setCtx(c as Fdc3InstrumentContext);
      })
      .then((s) => {
        if (cancelled) s.unsubscribe();
        else sub = s;
      });
    return () => {
      cancelled = true;
      sub?.unsubscribe();
    };
  }, []);
  return ctx;
}

export function isContactContext(ctx: Fdc3Context | null): ctx is Fdc3ContactContext {
  return !!ctx && ctx.type === 'fdc3.contact';
}

export function isInstrumentContext(ctx: Fdc3Context | null): ctx is Fdc3InstrumentContext {
  return !!ctx && ctx.type === 'fdc3.instrument';
}
