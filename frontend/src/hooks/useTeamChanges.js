/**
 * @module useTeamChanges
 * @description Custom hook for managing WebSocket connection to team change notifications
 */

import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { getUnreadChangeLogs } from "../services/changeLogService";
import { api } from "../services/api";

/**
 * Custom hook to handle WebSocket connection for team change notifications
 * @param {boolean} isAdmin - Whether the current user is an admin
 * @returns {Object} Hook state and methods
 * @returns {Array} return.changes - Array of unread changes
 * @returns {number} return.unreadCount - Count of unread changes
 * @returns {Function} return.refreshChanges - Function to refresh unread changes
 * @returns {boolean} return.connected - WebSocket connection status
 */
export const useTeamChanges = (isAdmin) => {
  const [changes, setChanges] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  /**
   * Fetches unread changes from the API
   */
  const refreshChanges = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const data = await getUnreadChangeLogs();
      setChanges(data.changes || []);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error("Error refreshing changes:", error);
    }
  }, [isAdmin]);

  /**
   * Decrements the unread counter
   */
  const decrementUnreadCount = useCallback((count = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - count));
  }, []);

  useEffect(() => {
    // Only connect if user is admin
    if (!isAdmin) {
      return;
    }

    let socket;

    const connectWebSocket = async () => {
      try {
        // Get JWT token from backend endpoint
        const response = await api.get("/users/ws-token");
        const token = response.data.token;

        // Create WebSocket connection to /admin namespace
        socket = io("http://localhost:5000/admin", {
          query: { token },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
          setConnected(true);
          // Refresh changes when connected
          refreshChanges();
        });

        socket.on("connect_error", () => {
          setConnected(false);
        });

        socket.on("disconnect", () => {
          setConnected(false);
        });

        // Listen for team change events
        socket.on("team-change", (data) => {
          // Create the change object with readBy empty (it's unread)
          const newChange = {
            ...data,
            readBy: [], // Mark as unread
          };
          
          // Add new change to the list
          setChanges((prev) => [newChange, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Optional: Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Nueva Novedad de Equipo", {
              body: data.description,
              icon: "/logoUdeA.png",
            });
          }
        });
      } catch {
        setConnected(false);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAdmin, refreshChanges]);

  // Load initial unread changes on mount
  useEffect(() => {
    refreshChanges();
  }, [refreshChanges]);

  // Request notification permission on mount (if admin)
  useEffect(() => {
    if (isAdmin && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isAdmin]);

  return {
    changes,
    unreadCount,
    refreshChanges,
    decrementUnreadCount,
    connected,
  };
};
