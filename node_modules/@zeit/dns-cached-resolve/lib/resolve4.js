"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolve4(host, resolver) {
    return new Promise((resolve, reject) => {
        resolver.resolve4(host, { ttl: true }, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
exports.default = resolve4;
