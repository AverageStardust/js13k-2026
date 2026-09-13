export interface TileData {
    rune: string;
    colour: string;
    breakStrength: number;
    breakSpeed: number;
    isGround: boolean;
    items?: number[];
}

export interface ItemData {
    name: string;
    toolStrength?: number;
    tile?: number;
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

export const TILE_DATA: TileData[] = [
    { // grass
        rune: ",",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
    },
    { // gravel
        rune: ".",
        colour: "#888",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
        items: [STONE_ITEM],
    },
    { // dirt
        rune: "_",
        colour: "#750",
        breakStrength: Infinity,
        breakSpeed: 0,
        isGround : true,
    },
    { // bushes
        rune: "⁂",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.1,
        isGround: false,
        items: [FIBRE_ITEM],
    },
    { // oak tree
        rune: "🌳",
        colour: "#090",
        breakStrength: 1,
        breakSpeed: 0.1,
        isGround: false,
        items: [FIBRE_ITEM, LOG_ITEM],
    },
    { // pine tree
        rune: "🌲",
        colour: "#090",
        breakStrength: 1,
        breakSpeed: 0.1,
        isGround: false,
        items: [LOG_ITEM],
    }
];

export const ITEM_DATA: ItemData[] = [
    {
        name: "🌿 Fibre",
    },
    {
        name: "🪨 Stone",
        toolStrength: 1,
        tile: GRAVEL_TILE,
    },
    {
        name: "🪵 Log",
    },
];
