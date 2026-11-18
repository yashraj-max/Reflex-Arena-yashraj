// Checks if the backend is awake when the page opens.
// Render's free plan puts a server to sleep after 15 minutes without visitors;
// the first request wakes it up, which can take up to a minute.
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { config } from '../config.js';

export function useServerStatus() {
  // state: mock | checking | waking | online | offline
  const [status, setStatus] = useState({ state: config.USE_MOCK ? 'mock' : 'checking' });

  const check = useCallback(async () => {
    if (config.USE_MOCK) return;
    setStatus({ state: 'checking' });
    // If there is no answer within 2.5 s, the server is probably waking up.
    const slow = setTimeout(() => setStatus({ state: 'waking' }), 2500);
    try {
      const data = await api.health();
      setStatus({ state: 'online', version: data.version, stretch: Boolean(data.stretch) });
    } catch (err) {
      setStatus({ state: 'offline', message: err.message });
    } finally {
      clearTimeout(slow);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { ...status, retry: check };
}
