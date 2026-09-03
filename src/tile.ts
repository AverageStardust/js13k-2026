export interface TileData {
    rune: string;
    colour: string;
}

export const TILES: TileData[] = [
    {
        rune: ",",
        colour: "#090",
    },
    {
        rune: "⁂",
        colour: "#090",
    },
    {
        rune: "🌳",
        colour: "#090",
    }
];

export const GRASS_TILE = 0;
export const BUSHES_TILE = 1;
export const TREE_TILE = 2;
