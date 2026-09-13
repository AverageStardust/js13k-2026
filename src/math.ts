export class Vector {
    x: number;
    y: number;

    static Polar(angle: number, length: number) {
        return new Vector(Math.cos(angle), Math.sin(angle)).scale(length);
    }

    constructor(x: number = 0, y: number = x) {
        this.x = x;
        this.y = y;
    }

    hash(): number {
        return this.x + this.y * 1000000;
    }

    add(other: Vector): Vector {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    addComponents(x: number, y: number): Vector {
        return new Vector(this.x + x, this.y + y);
    }

    sub(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    scale(b: number): Vector {
        return new Vector(this.x * b, this.y * b);
    }

    normalize(length: number = 1): Vector {
        return this.scale(length / this.length());
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }

    modulus(other: Vector): Vector {
        return new Vector(modulus(this.x, other.x), modulus(this.y, other.y));
    }

    length(): number {
        return Math.hypot(this.x, this.y);
    }

    area(): number {
        return this.x * this.y;
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    floor(): Vector {
        return new Vector(Math.floor(this.x), Math.floor(this.y));
    }

    round(): Vector {
        return new Vector(Math.round(this.x), Math.round(this.y));
    }

    ceil(): Vector {
        return new Vector(Math.ceil(this.x), Math.ceil(this.y));
    }
}

export function modulus(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function smoothStep(x: number): number {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return 3 * x * x - 2 * x * x * x;
}

export function lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
}
