export interface TileData {
    rune: string;
    colour: string;
    breakStrength: number;
    breakSpeed: number;
    isGround: boolean;
    lootItems?: number[];
}

export interface ItemData {
    name: string;
    toolStrength?: number;
    placesTile?: number;
}

export const GRASS_TILE = 0;
export const GRAVEL_TILE = 1;
export const DIRT_TILE = 2;
export const BUSHES_TILE = 3;
export const OAK_TREE_TILE = 4;
export const PINE_TREE_TILE = 5;

export const FIBRE_ITEM = 0;
export const STONE_ITEM = 1;
export const LOG_ITEM = 2;

export const PLAYER_STEP_SOUND = 0;
export const CHOP_SOUND = 1;
export const BOUNCE_SOUND = 2;
export const DROP_SOUND = 3;

export const TILE_DATA: TileData[] = [
    {
        // grass
        rune: ",",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
    },
    {
        // gravel
        rune: ".",
        colour: "#888",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
        lootItems: [STONE_ITEM],
    },
    {
        // dirt
        rune: "_",
        colour: "#750",
        breakStrength: Infinity,
        breakSpeed: 0,
        isGround: true,
    },
    {
        // bushes
        rune: "⁂",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.1,
        isGround: false,
        lootItems: [FIBRE_ITEM],
    },
    {
        // oak tree
        rune: "🌳",
        colour: "#090",
        breakStrength: 1,
        breakSpeed: 0.1,
        isGround: false,
        lootItems: [FIBRE_ITEM, LOG_ITEM],
    },
    {
        // pine tree
        rune: "🌲",
        colour: "#090",
        breakStrength: 1,
        breakSpeed: 0.1,
        isGround: false,
        lootItems: [LOG_ITEM],
    },
];

export const ITEM_DATA: ItemData[] = [
    {
        name: "🌿 Fibre",
    },
    {
        name: "🪨 Stone",
        toolStrength: 1,
        placesTile: GRAVEL_TILE,
    },
    {
        name: "🪵 Log",
    },
];

export const SOUND_DATA: (number | undefined)[][] = [
    [0.2, 204, 0.05, , , 4, 4, , -1, , 0.01, , , , 0.2, , 0.4, 0.1], // player step
    [, 100, 0.01, 0.03, , 4, 0, 0.2, , , 0.01, , -0.1, , 0.1, , 0.92, 0.04], // chop
    [, 181, , 0.03, , 3, 3.6, , -5, , , , 1.4, , 0.3, , 0.1, 0.05, , 1078], // bounce,
    [, 400, , 0.1, 0.02, 5, , , -6, , , 0.1, 2, , 0.4, 0.1, , 0.02, 0.05, -2e3], // drop,
];
