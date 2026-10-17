import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stompService } from '../services/stompClient';

const GameContext = createContext(null);

const API_BASE = import.meta.env.VITE_BACKEND_URL 
  ? import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '') 
  : '';

export const GameProvider = ({ children }) => {
  const [username, setUsername] = useState(() => localStorage.getItem('cah_username') || '');
  const [roomId, setRoomId] = useState(() => sessionStorage.getItem('cah_roomId') || '');
  const [playerId, setPlayerId] = useState(() => sessionStorage.getItem('cah_playerId') || '');
  const [roomState, setRoomState] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isJudge, setIsJudge] = useState(false);
  const [connected, setConnected] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [infoToast, setInfoToast] = useState(null);

  // Show temporary toast
  const showToast = useCallback((msg, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setInfoToast(msg);
      setTimeout(() => setInfoToast(null), 3500);
    }
  }, []);

  // Connect STOMP on mount
  useEffect(() => {
    const unsubConnect = stompService.onConnect(() => {
      setConnected(true);
    });

    stompService.connect().catch((err) => {
      console.error('STOMP connection error:', err);
      setConnected(false);
    });

    // Room created response (contains initial room info & assigned playerId)
    const unsubRoomCreated = stompService.subscribe('/user/queue/room-created', (data) => {
      setRoomState(data);
      setRoomId(data.roomId);
      sessionStorage.setItem('cah_roomId', data.roomId);
      if (data.players && data.players.length > 0) {
        const me = data.players[0];
        setPlayerId(me.id);
        sessionStorage.setItem('cah_playerId', me.id);
      }
      showToast(`Room created: ${data.roomId}`);
    });

    // Private hand queue (personal cards & status)
    const unsubHand = stompService.subscribe('/user/queue/hand', (data) => {
      if (data) {
        if (data.playerId) {
          setPlayerId(data.playerId);
          sessionStorage.setItem('cah_playerId', data.playerId);
        }
        if (data.hand) {
          setMyHand(data.hand);
        }
        setHasSubmitted(!!data.hasSubmitted);
        setIsJudge(!!data.isJudge);
      }
    });

    // Error messages
    const unsubErrors = stompService.subscribe('/user/queue/errors', (data) => {
      if (data && data.error) {
        showToast(data.error, true);
      }
    });

    return () => {
      unsubConnect();
      unsubRoomCreated();
      unsubHand();
      unsubErrors();
    };
  }, [showToast]);

  // Refresh room state directly via REST to survive reloads and missed WebSocket messages
  const refreshRoomState = useCallback(async (targetRoomId) => {
    const code = targetRoomId || roomId;
    if (!code) return;
    try {
      const res = await fetch(`${API_BASE}/api/room/${code}`);
      if (res.status === 404) {
        sessionStorage.removeItem('cah_roomId');
        sessionStorage.removeItem('cah_playerId');
        setRoomId('');
        setPlayerId('');
        setRoomState(null);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setRoomState(data);
        if (data.players) {
          const me = data.players.find((p) => 
            (playerId && p.id === playerId) ||
            (username && p.username.trim().toLowerCase() === username.trim().toLowerCase())
          );
          if (me) {
            if (!playerId || playerId !== me.id) {
              setPlayerId(me.id);
              sessionStorage.setItem('cah_playerId', me.id);
            }
            setHasSubmitted(Boolean(me.hasSubmitted));
            setIsJudge(Boolean(me.isJudge));
          }
        }
      }
    } catch (err) {
      // ignore network blips
    }
  }, [roomId, playerId, username]);

  // Initial load and periodic background sync (every 2.5s) to guarantee no stale states or missing players
  useEffect(() => {
    if (!roomId) return;

    refreshRoomState(roomId);

    const interval = setInterval(() => {
      refreshRoomState(roomId);
    }, 2500);

    return () => clearInterval(interval);
  }, [roomId, refreshRoomState]);

  // When WebSocket connects and room/player identity are present, re-bind socket session on server
  useEffect(() => {
    if (connected && roomId && playerId) {
      stompService.send('/app/room.hand', { roomId, playerId });
    }
  }, [connected, roomId, playerId]);

  // Subscribe to room-wide public topic whenever roomId changes
  useEffect(() => {
    if (!roomId) return;

    const unsubRoom = stompService.subscribe(`/topic/room/${roomId}`, (data) => {
      setRoomState(data);

      if (data.message) {
        showToast(data.message);
      }

      // Synchronize player identity and judge/submitted status
      if (data.players) {
        const me = data.players.find((p) => 
          (playerId && p.id === playerId) ||
          (username && p.username.trim().toLowerCase() === username.trim().toLowerCase())
        );
        if (me) {
          if (!playerId || playerId !== me.id) {
            setPlayerId(me.id);
            sessionStorage.setItem('cah_playerId', me.id);
          }
          setHasSubmitted(Boolean(me.hasSubmitted));
          setIsJudge(Boolean(me.isJudge));
        }
      }
    });

    return () => {
      unsubRoom();
    };
  }, [roomId, playerId, username, showToast]);

  // Subscribe to player-specific hand topic when roomId and playerId are known
  useEffect(() => {
    if (!roomId || !playerId) return;

    const unsubPlayerHand = stompService.subscribe(
      `/topic/room/${roomId}/player/${playerId}/hand`,
      (data) => {
        if (data) {
          if (data.hand) {
            setMyHand(data.hand);
          }
          setHasSubmitted(Boolean(data.hasSubmitted));
          setIsJudge(Boolean(data.isJudge));
        }
      }
    );

    return () => {
      unsubPlayerHand();
    };
  }, [roomId, playerId]);

  // Request hand on demand
  const requestHand = useCallback(() => {
    if (roomId) {
      stompService.send('/app/room.hand', { roomId, playerId });
    }
  }, [roomId, playerId]);

  // Auto-request hand if in SUBMITTING phase, not judge, and hand is empty
  useEffect(() => {
    if (roomState?.phase === 'SUBMITTING' && !isJudge && myHand.length === 0 && roomId) {
      requestHand();
    }
  }, [roomState?.phase, isJudge, myHand.length, roomId, requestHand]);

  // Game actions
  const createRoom = useCallback(async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    localStorage.setItem('cah_username', trimmed);

    try {
      const res = await fetch(`${API_BASE}/api/room/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create room', true);
        return;
      }

      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setRoomState(data.roomState);
      sessionStorage.setItem('cah_roomId', data.roomId);
      sessionStorage.setItem('cah_playerId', data.playerId);
      showToast(`Room created: ${data.roomId}`);
    } catch (err) {
      console.warn('REST create failed, falling back to STOMP:', err);
      stompService.send('/app/room.create', { username: trimmed });
    }
  }, [showToast]);

  const joinRoom = useCallback(async (code, name) => {
    const trimmedName = name.trim();
    const upperCode = code.trim().toUpperCase();
    if (!trimmedName || !upperCode) return;
    setUsername(trimmedName);
    localStorage.setItem('cah_username', trimmedName);

    try {
      const res = await fetch(`${API_BASE}/api/room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: upperCode, username: trimmedName }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to join room', true);
        return;
      }

      setRoomId(data.roomId);
      setPlayerId(data.playerId);
      setRoomState(data.roomState);
      sessionStorage.setItem('cah_roomId', data.roomId);
      sessionStorage.setItem('cah_playerId', data.playerId);
      showToast(`Joined room: ${data.roomId}`);
    } catch (err) {
      console.warn('REST join failed, falling back to STOMP:', err);
      setRoomId(upperCode);
      sessionStorage.setItem('cah_roomId', upperCode);
      stompService.send('/app/room.join', { roomId: upperCode, username: trimmedName });
    }
  }, [showToast]);

  const startGame = useCallback((maxRounds, timerSeconds) => {
    if (!roomId) return;
    stompService.send('/app/room.start', { roomId, playerId, maxRounds, timerSeconds });
  }, [roomId, playerId]);

  const submitCards = useCallback((cardIds) => {
    if (!roomId || !cardIds || cardIds.length === 0) return;
    stompService.send('/app/room.submit', { roomId, playerId, cardIds });
  }, [roomId, playerId]);

  const judgeSubmission = useCallback((winningSubmissionId) => {
    if (!roomId || !winningSubmissionId) return;
    stompService.send('/app/room.judge', { roomId, playerId, judgeId: playerId, winningSubmissionId });
  }, [roomId, playerId]);

  const nextRound = useCallback(() => {
    if (!roomId) return;
    stompService.send('/app/room.next-round', { roomId, playerId });
  }, [roomId, playerId]);

  const leaveRoom = useCallback(async () => {
    if (roomId && playerId) {
      try {
        await fetch(`${API_BASE}/api/room/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, playerId }),
        });
      } catch (e) {
        // ignore
      }
    }
    setRoomId('');
    setRoomState(null);
    setMyHand([]);
    setPlayerId('');
    sessionStorage.removeItem('cah_roomId');
    sessionStorage.removeItem('cah_playerId');
    // Reconnect to get clean session
    stompService.disconnect();
    stompService.connect().then(() => setConnected(true));
  }, [roomId, playerId]);

  const currentMe = roomState?.players?.find((p) => 
    (playerId && p.id === playerId) || 
    (username && p.username.trim().toLowerCase() === username.trim().toLowerCase())
  );

  const amIHost = Boolean(currentMe?.isHost);
  const amIJudge = Boolean(isJudge || currentMe?.isJudge);

  return (
    <GameContext.Provider
      value={{
        username,
        roomId,
        playerId,
        roomState,
        myHand,
        hasSubmitted,
        isJudge: amIJudge,
        isHost: amIHost,
        connected,
        errorToast,
        infoToast,
        createRoom,
        joinRoom,
        startGame,
        submitCards,
        judgeSubmission,
        nextRound,
        leaveRoom,
        requestHand,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
