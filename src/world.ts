import { Entity } from "./entity.js";
import { BUSHES_TILE, GRASS_TILE, TILES, TREE_TILE, TileData } from "./tile.js";
import { Vector, vectorHash } from "./vector.js";

const WORLD_SIZE = 100;
const WORLD_AREA = WORLD_SIZE * WORLD_SIZE;

export class World {
    time: number = 0;
    tiles: number[][];
    entities: Record<number, Entity> = {};

    static inflate(state: string): World {
        const world = Object.setPrototypeOf(JSON.parse(state), World.prototype);

        for (const entity of Object.values(world.entities)) {
            Entity.inflate(entity);
        }

        return world as World;
    }

    constructor() {
        this.tiles = [];
        for (let y = 0; y < WORLD_SIZE; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_SIZE; x++) {
                this.tiles[y][x] = GRASS_TILE;
            }
        }

        this.scatter(GRASS_TILE, BUSHES_TILE, 0.01);
        this.scatter(GRASS_TILE, TREE_TILE, 0.01);
    }

    scatter(find: number, replace: number, percent: number) {
        for (let i = 0; i < percent * WORLD_AREA; i++) {
            const x = Math.floor(Math.random() * WORLD_SIZE);
            const y = Math.floor(Math.random() * WORLD_SIZE);

            if (this.tiles[y][x] == find) {
                this.tiles[y][x] = replace;
            }
        }
    }

    getTileData(x: number, y: number): TileData {
        return TILES[this.getTile(x, y)];
    }

    getTile(x: number, y: number): number {
        return this.tiles[modulus(y, WORLD_SIZE)][modulus(x, WORLD_SIZE)];
    }

    setTile(x: number, y: number, tileId: number) {
        this.tiles[modulus(y, WORLD_SIZE)][modulus(x, WORLD_SIZE)] = tileId;
    }

    render(position: Vector, ctx: CanvasRenderingContext2D) {
        const entityByPosition: Record<number, Entity> = {};
        for (const entity of Object.values(this.entities)) {
            const hash = vectorHash(entity.position);
            const oldEntity = entityByPosition[hash];

            if (
                entity.active &&
                (oldEntity === undefined ||
                    oldEntity.depth < entity.depth)
            ) {
                entityByPosition[hash] = entity;
            }
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 544, 544);

        ctx.font = "26px 'Nimbus Mono PS', 'Courier New', monospace";
        ctx.textAlign = "center";
        for (let x = 0; x < 17; x++) {
            for (let y = 0; y < 17; y++) {
                const i = x + position[0] - 8;
                const j = y + position[1] - 8;

                const entity: Entity | undefined = entityByPosition[vectorHash([i, j])];
                const tileData = this.getTileData(i, j);

                ctx.fillStyle = tileData.colour + "3";
                ctx.fillRect(x * 32, y * 32, 32, 32);

                if (entity === undefined) {
                    ctx.fillStyle = tileData.colour;
                } else {
                    ctx.fillStyle = "#fff";
                }
                ctx.fillText(entity?.char ?? tileData.char, x * 32 + 16, y * 32 + 24);
            }
        }
    }
}

function modulus(n: number, m: number) {
    return ((n % m) + m) % m;
}
