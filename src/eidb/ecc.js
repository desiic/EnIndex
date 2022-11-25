/**
 * JS implementations of secp256k1 (aka K256, Bitcoin)
 * Ref: https://paulmillr.com/posts/noble-secp256k1-fast-ecc/
 * 
 * Terms:<br/>
 * p:   Prime number, 
 * n:   Field size (max d+1), 
 * d:   Decryption key,
 * a,b: Curve coefficients (or just 2 numbers), 
 * A,B: 2 points
 * x,y: 2D coords (also a pair to make public key), 
 * u,v: ...?
 * gcd: Greatest common divisor, 
 * G:   Base point on curve.
 * 
 * Lower-case: numbers, upper-case: compounds (eg. points)
 */

// Shorthands
var log = console.log;

/**
 * Elliptic curve
 */ 
var Curve = {p:0, n:0, gx:0, gy:0};

/**
 * Modulo (not remainder %)
 */ 
function mod(a, b=Curve.p) {
    const result = a % b;
    return result>=0n? result : b+result;
}

// Inverses number over modulo
function invert(number, modulo=Curve.p) {
    if (number===0n || modulo<=0n) {
        throw new Error(`invert: Expected positive integers, got n=${number} mod=${modulo}`);
    }

    // Eucledian GCD https://brilliant.org/wiki/extended-euclidean-algorithm/
    let a         = mod(number, modulo);
    let b         = modulo;
    let [x,y,u,v] = [0n, 1n, 1n, 0n];

    while (a !== 0n) {
        const q = b / a;
        const r = b % a;
        const m = x - u * q;
        const n = y - v * q;
        [b,a]   = [a, r];
        [x,y]   = [u, v];
        [u,v]   = [m, n];
    }

    const gcd = b;
    if (gcd !== 1n) throw new Error("invert: Does not exist(?)");
    return mod(x, modulo);
}

/**
 * Point on elliptic curve
 */ 
class Point {
    static ZERO = new Point(0n, 0n); // Point at infinity aka identity point aka zero

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }

    // Adds point to itself. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    double() {
        const x1  = this.x;
        const y1  = this.y;
        const lam = mod(3n * x1**2n * invert(2n*y1, Curve.p));
        const x3  = mod(lam*lam - 2n*x1);
        const y3  = mod(lam * (x1-x3) - y1);
        return new Point(x3, y3);
    }

    // Adds point to other point. http://hyperelliptic.org/EFD/g1p/auto-shortw.html
    add(Other) {
        const [A,B]         = [this, Other];
        const [x1,y1,x2,y2] = [A.x, A.y, B.x, B.y];

        if (x1 === 0n || y1 ===  0n) return B;
        if (x2 === 0n || y2 ===  0n) return A;
        if (x1 === x2 && y1 ===  y2) return this.double();
        if (x1 === x2 && y1 === -y2) return Point.ZERO;

        const lam = mod((y2-y1) * invert(x2-x1, Curve.p));
        const x3  = mod(lam*lam - x1 - x2);
        const y3  = mod(lam * (x1-x3) - y1);
        return new Point(x3, y3);
    }

    // Double&add method, elliptic curve point multiplication with double-and-add algo.
    multiply_da(n) {
        let P = Point.ZERO;
        let D = this;

        while (n > 0n) {
            if (n & 1n) P=P.add(D);
            D = D.double();
            n >>= 1n;
        }

        return P;
    }
}  

/**
 * Set curve properties before calculation
 */ 
function set_curve(p,n,gx,gy){
    Curve = {p,n,gx,gy};
}

/**
 * Get public key point from private key
 */ 
function get_pubkey_point(G, d) { // d: Decryption key (a number)
    if (G instanceof Array)
        G = new Point(G[0], G[1]);

    return G.multiply_da(d);
}

// ES6 export  
export {Point, set_curve, get_pubkey_point} ;
// EOF