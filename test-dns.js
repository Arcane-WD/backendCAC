import dns from 'dns';

dns.resolveSrv('_mongodb._tcp.cluster0.l1zfglr.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS SRV lookup failed:', err);
    } else {
        console.log('DNS SRV records:', addresses);
    }
});