import type { WebSocket, WebSocketServer } from "ws";

const sockets = new Set<WebSocket>();

export default function setupEchoServer(wss: WebSocketServer) {
    wss.on("connection", (socket: WebSocket) => {
        sockets.add(socket);

        socket.on("message", (message: Uint8Array) => {
            broadcast(message, socket);
        });
    });
}

function broadcast(message: Uint8Array, except?: WebSocket) {
    sockets.forEach((socket) => {
        if (socket !== except) socket.send(message);
    });
}
