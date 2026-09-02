// // @ts-ignore
// import { WebSocket } from "https://play.js13kgames.com/2026/online/partysocket.js";
import { Client } from "./client.js";
import { AnyMessage } from "./message.js";
import { Server } from "./server.js";
import { World } from "./world.js";

function main() {
    const socket = new WebSocket("wss://relay.js13kgames.com/evanescent");
    const client = new Client();
    const server = new Server();

    socket.onmessage = (event: MessageEvent<string>) => {
        if (event.data[0] === "{") {
            const message = JSON.parse(event.data) as AnyMessage;

            client.receive(message);

            if (client.serverAge > server.age) {
                client.send = (message: AnyMessage) =>
                    socket.send(JSON.stringify(message));
                server.close();
            }

            server.receive(message);
        }
    };

    setInterval(() => {
        if (client.lastUpdate < Date.now() - 1000) {
            client.send = (message: AnyMessage) => server.receive(message);

            server.open(client.world ?? new World());
            client.resetConnection();
        }
    }, 100);

    server.send = (message: AnyMessage) => {
        socket.send(JSON.stringify(message));
        client.receive(message);
    };

    client.send = (message: AnyMessage) => socket.send(JSON.stringify(message));
}

main();
