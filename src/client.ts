import { Entity } from "./entity.js";
import { AnyMessage, InputSignal, UpdateSignal } from "./message.js";
import { Vector } from "./vector.js";
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
    }

    receive(message: AnyMessage): void {
        if (message.sig === UpdateSignal) {
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
        if (player === undefined) {
            this.sendInput();
        } else {
            this.render(player.position);
        }
    }

    sendInput() {
        this.send({
            sig: InputSignal,
            uuid: this.playerUUID,
            input: this.playerInput
        });
    }

    render(position: Vector) {
        const entityByPosition: Record<number, Entity> = {}
        for (const entity of Object.values(this.world.entities)) {
            const hash = entity.position[0] + entity.position[1] * 2000;
            if (entityByPosition[hash] === undefined || entityByPosition[hash].visibility < entity.visibility) {
                entityByPosition[hash] = entity
            }
        }

        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, 544, 544);

        this.ctx.fillStyle = "#fff";
        this.ctx.font = "30px Courier New";
        this.ctx.textAlign = "center";
        for (let x = 0; x < 17; x++) {
            for (let y = 0; y < 17; y++) {
                const i = x + position[0] - 8;
                const j = y + position[1] - 8;
                let char = ".";

                const hash = i + j * 2000;

                if (entityByPosition[hash] !== undefined) {
                    char = entityByPosition[hash].char;
                }

                this.ctx.fillText(char, x * 32 + 16, y * 32 + 28);
            }
        }

        // this.inventory.innerText = ["item1", "item2", "item3"].join("\n");
    }
}
