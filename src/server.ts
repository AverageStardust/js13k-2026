import { Player } from "./being.js";
import { Client } from "./client.js";
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
    world!: World;
    private send!: (message: AnyMessage) => void;
    private loopHandle: number = -1;
    private soundHasCooldown: boolean[] = [];

    open(world: World) {
        if (this.isOpen()) return;

        this.loopHandle = setInterval(() => this.update(), UPDATE_DELAY);
        this.world = world;
    }

    isOpen(): boolean {
        return this.loopHandle > -1;
    }

    close() {
        clearInterval(this.loopHandle);
        this.loopHandle = -1;
    }

    connectToClients(socket: WebSocket, localClient?: Client) {
        this.send = (message: AnyMessage) => {
            // send server messages to remote clients
            socket.send(JSON.stringify(message));
            // send server message to our local client
            localClient?.receive(message);
        };
    }

    receive(message: AnyMessage): void {
        switch (message.sig) {
            case INPUT_SIGNAL:
                this.handleInput(message);
                break;
            case HOLD_SIGNAL:
                this.handleHold(message);
                break;
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
        if (this.soundHasCooldown[soundId] !== true) {
            this.send({
                sig: SOUND_SIGNAL,
                soundId,
                volume,
            });

            if (cooldown !== undefined) {
                this.soundHasCooldown[soundId] = true;
                setTimeout(
                    () => (this.soundHasCooldown[soundId] = false),
                    cooldown,
                );
            }
        }
    }

    private update() {
        this.world.update(this, UPDATE_DELAY);

        this.send({
            sig: UPDATE_SIGNAL,
            worldTime: this.world.time,
            state: JSON.stringify(this.world),
        });
    }
}
