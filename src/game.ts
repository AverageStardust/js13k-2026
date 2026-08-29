// // @ts-ignore
// import { WebSocket } from "https://play.js13kgames.com/2026/online/partysocket.js";
import { Client } from "./client.js";
import { AnyMessage } from "./message.js";
import { Server } from "./server.js";
import { World } from "./world.js";

export class Game {
    private socket: WebSocket;
    private client: Client;
    private server: Server;

    private isOnline: boolean = false;
    private isHosting?: boolean;

    constructor() {
        this.socket = new WebSocket("http://localhost:3000/ws");
        this.client = new Client();
        this.server = new Server();

        this.socket.onmessage = (event: MessageEvent<Blob>) =>
            this.receiveBroadcast(event);

        setInterval(() => {
            if (this.isOnline && this.client.lastUpdate < Date.now() - 2000) {
                this.goHosting();
            }
        }, 200);
    }

    goOffline() {
        this.isOnline = false;

        this.client.send = (message: AnyMessage) =>
            this.server.receive(message);
        this.server.send = (message: AnyMessage) =>
            this.client.receive(message);

        this.client.resetConnection();
        if (this.isHosting !== true) {
            this.server.open(new World());
        }
    }

    goOnline() {
        this.isOnline = true;

        this.server.send = (message: AnyMessage) => {
            this.socket.send(JSON.stringify(message));
            this.client.receive(message);
        };

        this.goVisiting();
    }

    goVisiting() {
        if (this.isHosting !== false) {
            this.isHosting = false;

            this.client.send = (message: AnyMessage) => this.socket.send(JSON.stringify(message));

            this.server.close();
        }
    }

    goHosting() {
        if (this.isHosting !== true) {
            this.isHosting = true;

            this.client.send = (message: AnyMessage) =>
                this.server.receive(message);

            this.server.open(this.client.world ?? new World());
            this.client.resetConnection();
        }
    }

    receiveBroadcast(event: MessageEvent<Blob>) {
        if (this.isOnline) {
            event.data.text().then((text: string) => {
                const message = JSON.parse(text) as AnyMessage;

                this.client.receive(message);

                if (this.client.serverAge > this.server.age) {
                    this.goVisiting();
                }

                if (this.isHosting) {
                    this.server.receive(message);
                }
            });
        }
    }
}
