import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false,
  query: {
    JUST_TO_BE_ABLE_TO_ADD_QUERY_DYNAMICALLY: true,
  },
});
