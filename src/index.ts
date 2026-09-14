import { Client } from "./client.js";
import { AnyMessage } from "./message.js";
import { Server } from "./server.js";
import { World } from "./world.js";

function main() {
    // connect to echo server
    const socket = new WebSocket("wss://relay.js13kgames.com/evanescent");

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // draw loading text
    ctx.font = "26px 'Nimbus Mono PS', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.fillText("Searching for server...", 272, 272);

    socket.onopen = () => onSocketOpen(socket, ctx);
}

function onSocketOpen(socket: WebSocket, ctx: CanvasRenderingContext2D) {
    // we assume we need to start a local game server until proven otherwise
    const [client, server] = setupGameWithLocalServer(socket, ctx);

    socket.onmessage = (event: MessageEvent<string>) => {
        if (event.data[0] !== "{") return;
        const message = JSON.parse(event.data) as AnyMessage;

        client.receive(message);

        // check if there is an older remote server being received by the client
        if (client.getWorldTime() > server.world.time) {
            moveGameToRemoteServer(socket, client, server);
        } else if(server.isOpen()) {
            server.receive(message);
        }
    };

    setInterval(() => {
        // check if the client hasn't be receiving updates for too long
        if (client.lastUpdate < Date.now() - 1000) {
            moveGameToLocalServer(client, server);
        }
    }, 100);
}

function setupGameWithLocalServer(
    socket: WebSocket,
    ctx: CanvasRenderingContext2D,
): [Client, Server] {
    const client = new Client(ctx);
    const server = new Server();

    server.send = (message: AnyMessage) => {
        // send server messages to remote clients
        socket.send(JSON.stringify(message));
        // send server message to our local client
        client.receive(message);
    };

    // send local client messages to local server
    client.send = (message: AnyMessage) => {
        server.receive(JSON.parse(JSON.stringify(message)));
    };

    return [client, server];
}

function moveGameToRemoteServer(
    socket: WebSocket,
    client: Client,
    server: Server,
) {
    // send client messages to remote server
    client.send = (message: AnyMessage) => {
        socket.send(JSON.stringify(message));
    };

    // disable server
    server.close();
}

function moveGameToLocalServer(client: Client, server: Server) {
    // send local client messages to local server
    client.send = (message: AnyMessage) => {
        server.receive(JSON.parse(JSON.stringify(message)));
    };

    // re-enable server, making a new world if the client wasn't already playing on one
    server.open(client.world ?? new World());
    client.resetConnection();
}

main();
