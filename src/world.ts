import { Being as Being, Player } from "./being.js";
import {
    BUSHES_TILE,
    DIRT_TILE,
    GRASS_TILE,
    GRAVEL_TILE,
    OAK_TREE_TILE,
    PINE_TREE_TILE,
    TILE_DATA,
    TileData,
} from "./data.js";
import { Vector, vectorAdd, vectorScale, vectorHash, vectorModulus, vectorRound } from "./math.js";
import { Noise, RNG } from "./random.js";

const WORLD_SIZE = 100;
const WORLD_AREA = WORLD_SIZE * WORLD_SIZE;
const UPDATE_PERCENT = 0.005;

export class World {
    rng: RNG;
    time: number = 0;
    tiles: number[][];
    beings: Record<number, Being> = {};

    static inflate(state: string): World {
        // not a world yet but it's best if typescript knows the property names
        const world = Object.setPrototypeOf(
            JSON.parse(state),
            World.prototype,
        ) as World;

        Object.setPrototypeOf(world.rng, RNG.prototype);

        for (const being of Object.values(world.beings)) {
            Being.inflate(being);
        }

        return world as World;
    }

    constructor() {
        this.rng = new RNG(67);
        const noise = new Noise(this.rng.randInt());

        this.tiles = [];
        for (let y = 0; y < WORLD_SIZE; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_SIZE; x++) {
                const a = noise.simple(
                    [x * 0.2, y * 0.2],
                    [WORLD_SIZE * 0.2, WORLD_SIZE * 0.2],
                );
                if (a > 0.35) {
                    this.tiles[y][x] = GRAVEL_TILE;
                } else {
                    this.tiles[y][x] = GRASS_TILE;
                }
            }
        }

        this.scatter(GRASS_TILE, BUSHES_TILE, 0.01);
        this.groupedScatter(GRASS_TILE, OAK_TREE_TILE, 0.005, 6, 0.9);
        this.groupedScatter(GRASS_TILE, PINE_TREE_TILE, 0.005, 15, 0.9);
    }

    groupedScatter(find: number, replace: number, percent: number, radius: number, groupingChance: number) {
        let centerPosition: Vector = this.randomPosition();
        for (let i = 0; i < percent * WORLD_AREA;) {
            if (this.rng.randFloat() > groupingChance) {
                centerPosition = this.randomPosition();
            }

            const offset = vectorRound(vectorScale(this.rng.randUnitVector(), radius * this.rng.randFloat()));
            const position = vectorAdd(centerPosition, offset);
            if (this.getTile(position) == find) {
                this.setTile(position, replace);
                i++;
            }
        }
    }

    scatter(find: number, replace: number, percent: number) {
        for (let i = 0; i < percent * WORLD_AREA;) {
            const position = this.randomPosition();

            if (this.getTile(position) == find) {
                this.setTile(position, replace);
                i++;
            }
        }
    }

    randomPosition(): Vector {
        const x = this.rng.randIntN(WORLD_SIZE);
        const y = this.rng.randIntN(WORLD_SIZE);
        return [x, y];
    }

    hasNeighbour(position: Vector, tileId: number) {
        return (
            this.getTile(vectorAdd(position, [1, 0])) == tileId ||
            this.getTile(vectorAdd(position, [-1, 0])) == tileId ||
            this.getTile(vectorAdd(position, [0, 1])) == tileId ||
            this.getTile(vectorAdd(position, [0, -1])) == tileId
        );
    }

    getTileData(position: Vector): TileData {
        return TILE_DATA[this.getTile(position)];
    }

    getTile(position: Vector): number {
        position = vectorModulus(position, [WORLD_SIZE, WORLD_SIZE]);
        return this.tiles[position[1]][position[0]];
    }

    setTile(position: Vector, tileId: number) {
        position = vectorModulus(position, [WORLD_SIZE, WORLD_SIZE]);
        this.tiles[position[1]][position[0]] = tileId;
    }

    render(cameraPosition: Vector, ctx: CanvasRenderingContext2D) {
        const beingByPosition: Record<number, Being> = {};
        const selectedPositions: Record<number, number> = [];

        for (const being of Object.values(this.beings)) {
            const hash = vectorHash(being.position);
            const oldBeing = beingByPosition[hash];

            if (
                being.active &&
                (oldBeing === undefined || oldBeing.depth < being.depth)
            ) {
                beingByPosition[hash] = being;

                if (being instanceof Player && being.target !== undefined) {
                    selectedPositions[vectorHash(being.target)] =
                        being.breakProgress;
                }
            }
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 544, 544);

        ctx.font = "26px 'Nimbus Mono PS', 'Courier New', monospace";
        ctx.textAlign = "center";
        for (let x = 0; x < 17; x++) {
            for (let y = 0; y < 17; y++) {
                const position = vectorAdd(cameraPosition, [x - 8, y - 8]);

                const hash = vectorHash(position);
                const being: Being | undefined = beingByPosition[hash];
                const tileData = this.getTileData(position);

                const breakProgress = selectedPositions[hash];

                ctx.fillStyle = tileData.colour;
                if (breakProgress !== undefined) {
                    // light background if selected
                    if (breakProgress > 0 && this.time % 4 < 2) {
                        ctx.fillStyle += "77";
                    } else {
                        ctx.fillStyle += "55";
                    }
                } else {
                    ctx.fillStyle += "22";
                }
                ctx.fillRect(x * 32, y * 32, 32, 32);

                if (being === undefined) {
                    ctx.fillStyle = tileData.colour;
                } else {
                    ctx.fillStyle = "#fff";
                }

                let offsetX = 16,
                    offsetY = 24;
                if (breakProgress > 0) {
                    offsetX += (this.rng.randFloat() - 0.5) * (breakProgress * 2 + 1);
                    offsetY += (this.rng.randFloat() - 0.5) * (breakProgress * 2 + 1);
                    ctx.fillStyle += Math.ceil(255 - breakProgress * 255)
                        .toString(16)
                        .padStart(2, "0");
                }

                ctx.fillText(
                    being?.rune ?? tileData.rune,
                    x * 32 + offsetX,
                    y * 32 + offsetY,
                );
            }
        }
    }

    update() {
        for (let i = 0; i < UPDATE_PERCENT * WORLD_AREA; i++) {
            const position = this.randomPosition();
            const tile = this.getTile(position);
            switch (tile) {
                case DIRT_TILE:
                    if (this.hasNeighbour(position, GRASS_TILE)) {
                        this.setTile(position, GRASS_TILE);
                    }
            }
        }
    }

    hasNebour() {}
}
