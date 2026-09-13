import { Being, Player } from "./being.js";
import { AnyMessage, HOLD_SIGNAL, INPUT_SIGNAL, UPDATE_SIGNAL } from "./message.js";
import { World } from "./world.js";

export class Client {
    serverAge: number = 0;
    lastUpdate: number;
    world!: World;
    send!: (message: AnyMessage) => void;

    ctx: CanvasRenderingContext2D;

    playerUUID: number;
    playerInput: Record<string, boolean> = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.lastUpdate = Date.now();
        this.ctx = ctx;

        this.playerUUID = Being.getUUID();

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
            }
        }
    }

    update(world: World) {
        this.world = world;

        const player = this.world.beings[this.playerUUID] as Player;
        if (player !== undefined) {
            this.world.render(player.position, this.ctx);
            player.inventory.render(this);
        }

        this.sendInput();

        this.lastUpdate = Date.now();
    }

    sendInput() {
        this.send({
            sig: INPUT_SIGNAL,
            uuid: this.playerUUID,
            input: this.playerInput,
        });
    }

    sendHolding(itemId: number) {
        this.send({
            sig: HOLD_SIGNAL,
            uuid: this.playerUUID,
            itemId,
        });
    }
}
