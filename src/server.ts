import { Player } from "./being.js";
import {
    AnyMessage,
    HOLD_SIGNAL,
    HoldMessage,
    INPUT_SIGNAL,
    InputMessage,
    SOUND_SIGNAL,
    UPDATE_SIGNAL,
} from "./message.js";
import { World } from "./world.js";

const UPDATE_DELAY = 100;

export class Server {
    age: number = Math.random();
    send!: (message: AnyMessage) => void;

    world!: World;
    private loopHandle: number = -1;
    private soundOnCooldown: boolean[] = [];

    open(world: World) {
        if (this.loopHandle == -1) {
            this.loopHandle = setInterval(() => this.update(), UPDATE_DELAY);
            this.world = world;
        }
    }

    close() {
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    receive(message: AnyMessage): void {
        if (this.loopHandle > -1) {
            switch (message.sig) {
                case INPUT_SIGNAL:
                    this.handleInput(message);
                    break;
                case HOLD_SIGNAL:
                    this.handleHold(message);
                    break;
            }
        }
    }

    handleInput(message: InputMessage) {
        const player = this.getPlayer(message.uuid);
        player.setInput(message.input, this.world.time);
    }

    handleHold(message: HoldMessage) {
        const player = this.getPlayer(message.uuid);
        player.inventory.holding = message.itemId;
    }

    getPlayer(uuid: number): Player {
        let player = this.world.beings[uuid] as Player;

        if (player === undefined) {
            player = new Player();
            this.world.beings[uuid] = player;
        }

        return player;
    }

    playSound(soundId: number, volume: number, cooldown?: number) {
        if (this.soundOnCooldown[soundId] !== true) {
            this.send({
                sig: SOUND_SIGNAL,
                soundId,
                volume,
            });

            if (cooldown !== undefined) {
                this.soundOnCooldown[soundId] = true;
                setTimeout(
                    () => (this.soundOnCooldown[soundId] = false),
                    cooldown,
                );
            }
        }
    }

    private update() {
        this.world.update();

        for (const being of Object.values(this.world.beings)) {
            if (being.isActive) {
                being.update(this);
            }
        }

        this.world.time += UPDATE_DELAY;
        this.send({
            sig: UPDATE_SIGNAL,
            age: ++this.age,
            state: JSON.stringify(this.world),
        });
    }
}
