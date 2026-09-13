import { lerp, smoothStep, Vector } from "./math.js";

export class RNG {
    state!: number;

    constructor(seed: number = Math.floor(Math.random() * 2147483647)) {
        this.seed(seed);
    }

    seed(seed: number, shuffles = 4) {
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

    // [0, n)
    randIntN(n: number): number {
        return Math.floor((this.randInt() / 2147483647) * n);
    }

    // [0, 1]
    randFloat(): number {
        return this.randInt() / 2147483647;
    }

    // random unit vector
    randUnitVector(radius: number = 1): Vector {
        const float = this.randInt() / 2147483648;
        const angle = float * Math.PI * 2;

        return Vector.Polar(angle, radius);
    }
}

export class Noise {
    private rng: RNG;
    private offset: number;

    constructor(seed: number) {
        this.rng = new RNG(0);
        this.offset = seed;
    }

    complex(position: Vector, size: Vector): number {
        return this.simple(
            position.scale(0.1),
            size.scale(0.1),
        ) * 0.6 + this.simple(
            position.scale(0.2),
            size.scale(0.2),
        ) * 0.3 + this.simple(
            position.scale(0.5),
            size.scale(0.5),
        ) * 0.1
    }

    simple(position: Vector, size: Vector): number {
        const lowGrid = position.floor().modulus(size);
        const highGrid = position.ceil().modulus(size);
        const fractional = position.modulus(new Vector(1));

        this.rng.seed(lowGrid.x * 16 + lowGrid.y * 66536 + this.offset);
        const topLeft = this.rng.randUnitVector().dot(fractional);

        this.rng.seed(highGrid.x * 16 + lowGrid.y * 66536 + this.offset);
        const topRight = this.rng
            .randUnitVector()
            .dot(fractional.addComponents(-1, 0));

        this.rng.seed(lowGrid.x * 16 + highGrid.y * 66536 + this.offset);
        const bottomLeft = this.rng
            .randUnitVector()
            .dot(fractional.addComponents(0, -1));

        this.rng.seed(highGrid.x * 16 + highGrid.y * 66536 + this.offset);
        const bottomRight = this.rng
            .randUnitVector()
            .dot(fractional.addComponents(-1, -1));

        const top = lerp(topLeft, topRight, smoothStep(fractional.x));
        const bottom = lerp(bottomLeft, bottomRight, smoothStep(fractional.x));

        return lerp(top, bottom, smoothStep(fractional.y));
    }
}
