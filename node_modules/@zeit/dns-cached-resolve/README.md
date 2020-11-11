Caching DNS Resolver
====================

[![CircleCI](https://circleci.com/gh/zeit/dns-cached-resolve.svg?style=svg)](https://circleci.com/gh/zeit/dns-cached-resolve)

Cache DNS A and AAAA record resolutions.

## Example

**index.js**
```javascript
async function run() {
  console.log('resolve("zeit.co")');
  for (let i = 0; i < 10; i++) {
    console.time('resolve');
    console.log('IP: ', await dnsResolve('zeit.co'));
    console.timeEnd('resolve');
  }
}
run().catch(console.error);
```

```bash
% node index.js
resolve("zeit.co")
IP:  54.153.55.116
resolve: 569.156ms
IP:  54.153.55.116
resolve: 0.256ms
IP:  54.153.55.116
resolve: 0.061ms
IP:  54.153.55.116
resolve: 0.036ms
```
