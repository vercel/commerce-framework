"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolve6(host, resolver) {
    return new Promise((resolve, reject) => {
        resolver.resolve6(host, { ttl: true }, (err, res) => {
            if (err)
                return reject(err);
            resolve(res);
        });
    });
}
exports.default = resolve6;
