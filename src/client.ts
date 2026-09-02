import { Entity } from "./entity.js";
import { AnyMessage, INPUT_SIGNAL, UPDATE_SIGNAL } from "./message.js";
import { World } from "./world.js";

export class Client {
    serverAge: number = 0;
    lastUpdate: number;
    world!: World;
    send!: (message: AnyMessage) => void;

    ctx: CanvasRenderingContext2D;
    inventory: HTMLDivElement;

    playerUUID: number;
    playerInput: Record<string, boolean> = {};

    constructor() {
        this.lastUpdate = Date.now();

        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.inventory = document.querySelector("div") as HTMLDivElement;

        this.playerUUID = Entity.getUUID();

        document.onkeydown = (event) => {
            this.playerInput[event.key] = true;
            this.sendInput();
        };

        document.onkeyup = (event) => {
            this.playerInput[event.key] = false;
            this.sendInput();
        };
    }

    resetConnection() {
        // @ts-ignore
        this.world = undefined;
        this.serverAge = 0;
        this.lastUpdate = Date.now();
    }

    receive(message: AnyMessage): void {
        if (message.sig === UPDATE_SIGNAL) {
            if (message.age > this.serverAge) {
                this.update(World.inflate(message.state));
                this.serverAge = message.age;
                this.lastUpdate = Date.now();
            }
        }
    }

    update(world: World) {
        this.world = world;

        const player = this.world.entities[this.playerUUID];
        if (player !== undefined) {
            this.world.render(player.position, this.ctx);
        }

        this.sendInput();
    }

    sendInput() {
        this.send({
            sig: INPUT_SIGNAL,
            uuid: this.playerUUID,
            input: this.playerInput,
        });
    }
}
