import { Being, Player } from "./being.js";
import { SOUND_DATA } from "./data.js";
import {
    AnyMessage,
    HOLD_SIGNAL,
    INPUT_SIGNAL,
    SOUND_SIGNAL,
    SoundMessage,
    UPDATE_SIGNAL,
    UpdateMessage,
} from "./message.js";
import { World } from "./world.js";
import { zzfx } from "./ZzFXMicro.js";

export class Client {
    lastUpdate: number;
    world!: World;
    send!: (message: AnyMessage) => void;

    ctx: CanvasRenderingContext2D;

    playerUUID: number;
    playerInput: Record<string, boolean> = {};

    constructor(ctx: CanvasRenderingContext2D) {
        this.lastUpdate = Date.now();
        this.ctx = ctx;

        this.playerUUID = Being.randomUUID();

        document.onkeydown = (event) => {
            this.playerInput[event.code] = true;
            this.sendInput();
        };

        document.onkeyup = (event) => {
            this.playerInput[event.code] = false;
            this.sendInput();
        };
    }

    resetConnection() {
        // @ts-ignore
        this.world = undefined;
        this.lastUpdate = Date.now();
    }

    getWorldTime() {
        if (this.world === undefined) {
            return 0;
        } else {
            return this.world.time
        }
    }

    receive(message: AnyMessage): void {
        switch (message.sig) {
            case UPDATE_SIGNAL:
                this.handleUpdate(message);
                break;

            case SOUND_SIGNAL:
                this.handleSound(message);
                break;
        }
    }

    handleUpdate(message: UpdateMessage) {
        if (message.worldTime > this.getWorldTime()) {
            this.update(World.inflate(message.state));
        }
    }

    handleSound(message: SoundMessage) {
        const sound = SOUND_DATA[message.soundId];
        zzfx(message.volume * 0.1, ...sound);
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
