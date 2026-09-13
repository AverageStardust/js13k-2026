import {
    lerp,
    smoothStep,
    Vector,
    vectorCeil,
    vectorDot,
    vectorFloor,
    vectorModulus,
} from "./math.js";

export class RNG {
    state!: number;

    constructor(seed: number = Math.floor(Math.random() * 2147483647)) {
        this.seed(seed);
    }

    seed(seed: number, shuffles = 3) {
        this.state = seed;
        this.state %= 2147483648;
        for (let i = 0; i < shuffles; i++) {
            this.shuffle();
        }
    }

    advance() {
        const bit = (this.state ^ (this.state >> 3)) & 1;
        this.state = (this.state >> 1) | (bit << 30);
        return bit;
    }

    shuffle() {
        for (let i = 0; i < 32; i++) {
            this.advance();
        }
    }

    // [0, 2147483648)
    randInt(): number {
        this.shuffle();

        let stream = 0;
        for (let i = 0; i < 31; i++) {
            stream += this.advance() << i;
        }

        return stream;
    }

    randIntN(n: number): number {
        return Math.floor(this.randInt() / 2147483647 * n);
    }

    // [0, 1]
    randFloat(): number {
        return this.randInt() / 2147483647;
    }

    // random unit vector
    randUnitVector(): Vector {
        const float = this.randInt() / 2147483648;
        const angle = float * Math.PI * 2;

        return [Math.cos(angle), Math.sin(angle)];
    }
}

export class Noise {
    private rng: RNG;
    private offset: number;

    constructor(seed: number) {
        this.rng = new RNG(0);
        this.offset = seed;
    }

    simple(position: Vector, size: Vector): number {
        const topLeftGrid = vectorModulus(vectorFloor(position), size);
        const bottomRightGrid = vectorModulus(vectorCeil(position), size);
        const fx = position[0] % 1;
        const fy = position[1] % 1;

        this.rng.seed(topLeftGrid[0] + topLeftGrid[1] * 66536 + this.offset);
        const topLeft = vectorDot(this.rng.randUnitVector(), [fx, fy]);

        this.rng.seed(bottomRightGrid[0] + topLeftGrid[1] * 66536 + this.offset);
        const topRight = vectorDot(this.rng.randUnitVector(), [fx - 1, fy]);

        this.rng.seed(topLeftGrid[0] + bottomRightGrid[1] * 66536 + this.offset);
        const bottomLeft = vectorDot(this.rng.randUnitVector(), [fx, fy - 1]);

        this.rng.seed(bottomRightGrid[0] + bottomRightGrid[1] * 66536 + this.offset);
        const bottomRight = vectorDot(this.rng.randUnitVector(), [fx - 1, fy - 1]);

        const top = lerp(topLeft, topRight, smoothStep(fx));
        const bottom = lerp(bottomLeft, bottomRight, smoothStep(fx));

        return lerp(top, bottom, smoothStep(fy));
    }
}
