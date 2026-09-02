import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Protego Real-Time Socket Gateway:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Disconnected from Protego Socket Gateway');
    });
  }

  return socket;
};

export const subscribeToEvents = (callbacks: {
  onSOSAlert?: (data: any) => void;
  onSOSResolved?: (data: any) => void;
  onCrimeReported?: (data: any) => void;
  onCrimeUpdated?: (data: any) => void;
  onGDFiled?: (data: any) => void;
  onGDUpdated?: (data: any) => void;
  onNotification?: (data: any) => void;
}) => {
  const s = getSocket();

  if (callbacks.onSOSAlert) s.on('sos_alert', callbacks.onSOSAlert);
  if (callbacks.onSOSResolved) s.on('sos_resolved', callbacks.onSOSResolved);
  if (callbacks.onCrimeReported) s.on('crime_reported', callbacks.onCrimeReported);
  if (callbacks.onCrimeUpdated) s.on('crime_updated', callbacks.onCrimeUpdated);
  if (callbacks.onGDFiled) s.on('gd_filed', callbacks.onGDFiled);
  if (callbacks.onGDUpdated) s.on('gd_updated', callbacks.onGDUpdated);
  if (callbacks.onNotification) s.on('new_notification', callbacks.onNotification);

  return () => {
    if (callbacks.onSOSAlert) s.off('sos_alert', callbacks.onSOSAlert);
    if (callbacks.onSOSResolved) s.off('sos_resolved', callbacks.onSOSResolved);
    if (callbacks.onCrimeReported) s.off('crime_reported', callbacks.onCrimeReported);
    if (callbacks.onCrimeUpdated) s.off('crime_updated', callbacks.onCrimeUpdated);
    if (callbacks.onGDFiled) s.off('gd_filed', callbacks.onGDFiled);
    if (callbacks.onGDUpdated) s.off('gd_updated', callbacks.onGDUpdated);
    if (callbacks.onNotification) s.off('new_notification', callbacks.onNotification);
  };
};
