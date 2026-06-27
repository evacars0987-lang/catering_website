const http = require('http');

http.get('http://localhost:3000/app.js', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        const hasLog = data.includes('renderGalleryPosts: galleryDB size =');
        console.log('HAS NEW LOG IN SERVED app.js:', hasLog);
        console.log('SERVED app.js LENGTH:', data.length);
    });
}).on('error', (err) => {
    console.error('ERROR:', err.message);
});
