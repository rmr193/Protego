// Cross-tab and cross-window real-time SOS synchronization
const channel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('protego_sos_channel')
  : null;

export const broadcastSosState = (active: boolean, sosId: string | null = null) => {
  try {
    channel?.postMessage({
      type: active ? 'SOS_TRIGGERED' : 'SOS_RESOLVED',
      sosId,
      timestamp: Date.now()
    });

    localStorage.setItem('PROTEGO_SOS_ACTIVE', active ? 'true' : 'false');
    if (sosId) {
      localStorage.setItem('PROTEGO_SOS_ID', sosId);
    } else {
      localStorage.removeItem('PROTEGO_SOS_ID');
    }

    // Storage event for broader browser compatibility
    localStorage.setItem('PROTEGO_SOS_EVENT', JSON.stringify({ active, sosId, time: Date.now() }));
  } catch (e) {
    // Non-blocking
  }
};

export const subscribeToSosBroadcast = (onStateChange: (active: boolean, sosId: string | null) => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'SOS_RESOLVED') {
      onStateChange(false, null);
    } else if (event.data?.type === 'SOS_TRIGGERED') {
      onStateChange(true, event.data.sosId || null);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'PROTEGO_SOS_EVENT' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        onStateChange(Boolean(data.active), data.sosId || null);
      } catch {}
    }
  };

  channel?.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    channel?.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
};
