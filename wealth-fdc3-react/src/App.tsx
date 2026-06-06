import { useEffect, useMemo, useState } from 'react';
import { DesktopHeader } from './components/DesktopHeader';
import { Desktop } from './components/Desktop';
import { WealthDriver } from './driver/wealth-driver';
import { installFdc3Agent } from './fdc3/agent';
import { useWealthState } from './hooks/useWealthState';

installFdc3Agent();

function App() {
  const driver = useMemo(() => new WealthDriver(), []);
  const state = useWealthState(driver);
  const [channel, setChannel] = useState('fdc3.channel.1');

  useEffect(() => {
    driver.start();
    const agent = installFdc3Agent();
    agent.joinUserChannel('fdc3.channel.1').then(() => setChannel('fdc3.channel.1'));
    return () => driver.stop();
  }, [driver]);

  const joinChannel = async (id: string) => {
    await installFdc3Agent().joinUserChannel(id);
    setChannel(id);
  };

  return (
    <div className="h-full flex flex-col">
      <DesktopHeader currentChannel={channel} onChannelChange={joinChannel} />
      <main className="flex-1 min-h-0">
        <Desktop state={state} driver={driver} />
      </main>
    </div>
  );
}

export default App;
