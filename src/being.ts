import { Vector } from "./math.js";
import {
    DIRT_TILE,
    ITEM_DATA,
    CHOP_SOUND,
    PLAYER_STEP_SOUND,
    TILE_DATA,
    TileData,
    BOUNCE_SOUND,
    DROP_SOUND,
} from "./data.js";
import { Inventory } from "./inventory.js";
import { Server } from "./server.js";

export abstract class Being {
    static inflate(being: any) {
        switch (being.type) {
            case "player":
                Object.setPrototypeOf(being, Player.prototype);
                Object.setPrototypeOf(being.inventory, Inventory.prototype);
                if (being.target !== undefined) {
                    Object.setPrototypeOf(being.target, Vector.prototype);
                }
                break;
        }

        Object.setPrototypeOf(being.position, Vector.prototype);
    }

    static randomUUID(): number {
        return Math.floor(Math.random() * 2 ** 53);
    }

    abstract readonly type: string;
    readonly depth: number = 50;

    position: Vector = new Vector();
    moveDelay: number = 0;
    speed: number = 1 / 3;
    isActive: boolean = true;

    abstract rune: string;

    update(_: Server) {
        this.moveDelay -= this.speed;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.rune, 0, 0);
    }

    move(direction: Vector, server: Server) {
        if (direction.isZero()) {
            return false;
        }

        const newPosition = this.position.add(direction);
        const tileData = server.world.getTileData(newPosition);

        if (this.moveDelay <= 0.0001 && tileData.isGround) {
            this.position = newPosition;
            this.moveDelay = 1;
            return true;
        } else {
            return false;
        }
    }
}

export class Player extends Being {
    readonly type = "player";
    readonly depth = 100;
    readonly rune = "🐕";

    target: Vector | undefined = undefined;
    breakProgress: number = 0;
    input: Record<string, boolean> = {};
    lastInput: number = 0;
    inventory: Inventory = new Inventory();

    update(server: Server) {
        super.update(server);

        if (server.world.time > this.lastInput + 1000) {
            this.isActive = false;
        }

        this.handleInput(server);
    }

    handleInput(server: Server) {
        this.handleMovement(server);

        if (this.target !== undefined) {
            if (this.input["KeyQ"]) {
                this.handleBreaking(server, this.target);
            } else {
                this.breakProgress = 0;
            }

            if (this.input["KeyE"] && this.inventory.holding !== undefined) {
                this.handlePlacing(server, this.target, this.inventory.holding);
            }
        }
    }

    handleMovement(server: Server) {
        let movement = new Vector();

        if (this.input["KeyW"]) {
            movement = movement.addComponents(0, -1);
        }
        if (this.input["KeyS"]) {
            movement = movement.addComponents(0, 1);
        }
        if (this.input["KeyA"]) {
            movement = movement.addComponents(-1, 0);
        }
        if (this.input["KeyD"]) {
            movement = movement.addComponents(1, 0);
        }

        this.move(movement, server);
    }

    handleBreaking(server: Server, target: Vector) {
        const tileData = server.world.getTileData(target);

        if (this.canBreak(tileData)) {
            this.breakProgress += tileData.breakSpeed;
            server.playSound(CHOP_SOUND, 0.45, 200);

            if (this.breakProgress >= 1) {
                for (const itemId of tileData.items ?? []) {
                    this.inventory.add(itemId);
                }

                server.world.setTile(target, DIRT_TILE);
                this.breakProgress = 0;
            }
        } else {
            if (this.breakProgress >= 0 && !tileData.isGround) {
                server.playSound(BOUNCE_SOUND, 0.6);
            }

            this.breakProgress = -1;
        }
    }

    canBreak(tileData: TileData): boolean {
        let toolStrength = 0;

        const holdingItem = this.inventory.holding;
        if (holdingItem !== undefined) {
            const itemData = ITEM_DATA[holdingItem];
            if (itemData.toolStrength !== undefined) {
                toolStrength = itemData.toolStrength;
            }
        }

        return tileData.breakStrength <= toolStrength;
    }

    handlePlacing(server: Server, target: Vector, itemId: number) {
        const existingTileId = server.world.getTile(target);
        const tileData = TILE_DATA[existingTileId];

        if (tileData.isGround) {
            const itemTileId = ITEM_DATA[itemId].tile;

            if (itemTileId !== undefined && itemTileId !== existingTileId) {
                if (this.inventory.remove(itemId)) {
                    server.playSound(DROP_SOUND, 1);
                    server.world.setTile(target, itemTileId);
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.rune, 0, 0);

        if (this.target !== undefined && this.inventory.holding !== undefined) {
            const offset = this.target.sub(this.position).normalize(36);
            const heldItem = ITEM_DATA[this.inventory.holding];
            const itemSprite = heldItem.name.split(" ")[0];

            ctx.scale(0.5, 0.5);
            ctx.fillText(itemSprite, offset.x, offset.y);
            ctx.scale(2, 2);
        }
    }

    move(direction: Vector, server: Server) {
        if (super.move(direction, server)) {
            server.playSound(PLAYER_STEP_SOUND, 0.25);
            this.breakProgress = 0;
        }

        if (!direction.isZero()) {
            this.target = this.position.add(direction);
        }
        return true;
    }

    setInput(input: Record<string, boolean>, time: number) {
        this.input = input;
        this.lastInput = time;
        this.isActive = true;
    }
}
