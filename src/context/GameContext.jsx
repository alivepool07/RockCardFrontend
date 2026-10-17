import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Stable refs to break re-render cycles in background synchronization
  const roomIdRef = useRef(roomId);
  const playerIdRef = useRef(playerId);
  const usernameRef = useRef(username);
  const isFetchingRef = useRef(false);

  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { playerIdRef.current = playerId; }, [playerId]);
  useEffect(() => { usernameRef.current = username; }, [username]);

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
      console.warn('STOMP initial connection notice:', err);
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
        setHasSubmitted(Boolean(data.hasSubmitted));
        setIsJudge(Boolean(data.isJudge));
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

  // REST fallback to fetch player hand directly
  const fetchHand = useCallback(async (targetRoom, targetPid) => {
    const r = targetRoom || roomIdRef.current;
    const p = targetPid || playerIdRef.current;
    if (!r || !p) return;
    try {
      const res = await fetch(`${API_BASE}/api/room/${r}/hand/${p}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hand && Array.isArray(data.hand)) {
          setMyHand(data.hand);
        }
        setHasSubmitted(Boolean(data.hasSubmitted));
        setIsJudge(Boolean(data.isJudge));
      }
    } catch (e) {
      // non-critical, will retry or receive via STOMP
    }
  }, []);

  // Refresh room state directly via REST without recreating functions or causing infinite loops
  const refreshRoomState = useCallback(async (targetRoomId) => {
    const code = targetRoomId || roomIdRef.current;
    if (!code || isFetchingRef.current) return;
    isFetchingRef.current = true;

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
          const currentPid = playerIdRef.current;
          const currentUname = usernameRef.current;
          const me = data.players.find((p) => 
            (currentPid && p.id === currentPid) ||
            (currentUname && p.username.trim().toLowerCase() === currentUname.trim().toLowerCase())
          );
          if (me) {
            if (currentPid !== me.id) {
              setPlayerId(me.id);
              sessionStorage.setItem('cah_playerId', me.id);
              playerIdRef.current = me.id;
            }
            setHasSubmitted(Boolean(me.hasSubmitted));
            setIsJudge(Boolean(me.isJudge));
          }
        }
      }
    } catch (err) {
      // network blip ignored
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Periodic background sync (calm 3.5s interval) only active when inside a room
  useEffect(() => {
    if (!roomId) return;

    refreshRoomState(roomId);

    const interval = setInterval(() => {
      refreshRoomState(roomIdRef.current);
    }, 3500);

    return () => clearInterval(interval);
  }, [roomId, refreshRoomState]);

  // When WebSocket connects and room/player identity are present, re-bind socket session on server
  useEffect(() => {
    if (connected && roomId && playerId) {
      stompService.send('/app/room.hand', { roomId, playerId });
      fetchHand(roomId, playerId);
    }
  }, [connected, roomId, playerId, fetchHand]);

  // Subscribe to room-wide public topic whenever roomId changes
  useEffect(() => {
    if (!roomId) return;

    const unsubRoom = stompService.subscribe(`/topic/room/${roomId}`, (data) => {
      setRoomState(data);

      if (data.message) {
        showToast(data.message);
      }

      if (data.players) {
        const currentPid = playerIdRef.current;
        const currentUname = usernameRef.current;
        const me = data.players.find((p) => 
          (currentPid && p.id === currentPid) ||
          (currentUname && p.username.trim().toLowerCase() === currentUname.trim().toLowerCase())
        );
        if (me) {
          if (currentPid !== me.id) {
            setPlayerId(me.id);
            sessionStorage.setItem('cah_playerId', me.id);
            playerIdRef.current = me.id;
          }
          setHasSubmitted(Boolean(me.hasSubmitted));
          setIsJudge(Boolean(me.isJudge));
        }
      }
    });

    return () => {
      unsubRoom();
    };
  }, [roomId, showToast]);

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
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (currentRoom) {
      stompService.send('/app/room.hand', { roomId: currentRoom, playerId: currentPid });
      if (currentPid) {
        fetchHand(currentRoom, currentPid);
      }
    }
  }, [fetchHand]);

  // Auto-request hand if in SUBMITTING phase, not judge, and hand is empty
  useEffect(() => {
    if (roomState?.phase === 'SUBMITTING' && !isJudge && myHand.length === 0 && roomId && playerId) {
      requestHand();
    }
  }, [roomState?.phase, isJudge, myHand.length, roomId, playerId, requestHand]);

  // Game actions with dual-path execution (STOMP + REST) to ensure zero stuck actions on production
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
      fetchHand(data.roomId, data.playerId);
    } catch (err) {
      console.warn('REST join failed, falling back to STOMP:', err);
      setRoomId(upperCode);
      sessionStorage.setItem('cah_roomId', upperCode);
      stompService.send('/app/room.join', { roomId: upperCode, username: trimmedName });
    }
  }, [showToast, fetchHand]);

  const startGame = useCallback(async (maxRounds, timerSeconds) => {
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (!currentRoom) return;

    // Send via STOMP if connected
    stompService.send('/app/room.start', {
      roomId: currentRoom,
      playerId: currentPid,
      maxRounds,
      timerSeconds,
    });

    // Also call REST endpoint to guarantee start even if socket has reconnect jitter
    try {
      const res = await fetch(`${API_BASE}/api/room/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          playerId: currentPid,
          maxRounds,
          timerSeconds,
        }),
      });
      if (res.ok) {
        const state = await res.json();
        setRoomState(state);
        if (currentPid) {
          fetchHand(currentRoom, currentPid);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        if (err.error) showToast(err.error, true);
      }
    } catch (err) {
      // network fallback handled by STOMP or subsequent polling
    }
  }, [fetchHand, showToast]);

  const submitCards = useCallback(async (cardIds) => {
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (!currentRoom || !cardIds || cardIds.length === 0) return;

    setHasSubmitted(true);
    stompService.send('/app/room.submit', { roomId: currentRoom, playerId: currentPid, cardIds });

    try {
      await fetch(`${API_BASE}/api/room/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: currentRoom, playerId: currentPid, cardIds }),
      });
    } catch (e) {
      // handled by STOMP
    }
  }, []);

  const judgeSubmission = useCallback(async (winningSubmissionId) => {
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (!currentRoom || !winningSubmissionId) return;

    stompService.send('/app/room.judge', {
      roomId: currentRoom,
      playerId: currentPid,
      judgeId: currentPid,
      winningSubmissionId,
    });

    try {
      await fetch(`${API_BASE}/api/room/judge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: currentRoom,
          playerId: currentPid,
          judgeId: currentPid,
          winningSubmissionId,
        }),
      });
    } catch (e) {
      // handled by STOMP
    }
  }, []);

  const nextRound = useCallback(async () => {
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (!currentRoom) return;

    stompService.send('/app/room.next-round', { roomId: currentRoom, playerId: currentPid });

    try {
      await fetch(`${API_BASE}/api/room/next-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: currentRoom, playerId: currentPid }),
      });
    } catch (e) {
      // handled by STOMP
    }
  }, []);

  const leaveRoom = useCallback(async () => {
    const currentRoom = roomIdRef.current;
    const currentPid = playerIdRef.current;
    if (currentRoom && currentPid) {
      try {
        await fetch(`${API_BASE}/api/room/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: currentRoom, playerId: currentPid }),
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
    stompService.disconnect();
    stompService.connect().then(() => setConnected(true));
  }, []);

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
        fetchHand,
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
