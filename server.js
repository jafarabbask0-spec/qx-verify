const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Aapka Asli API System (Yeh chalta rahega par kisi ko dikhega nahi)
app.all('/api/postback', (req, res) => {
    // Yahan apna asli API logic likhein
    // Example: res.json({ success: true, message: "Data received" });
    res.status(200).send("API Working (Private)"); 
});

// 2. Fake Error Message Jo Sab Ko Dikhega
const fakeError = `404: NOT_FOUND
Code: NOT_FOUND
ID: sin1::x7pwq-1777404782061-921f3a347ac1`;

// 3. Sab kuch block kar do (Index.html bhi yahi show karega)
app.all('*', (req, res) => {
    // Header text/plain lazmi hai taake source code mein kuch na dikhe
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Asli 404 status bhejna
    res.status(404).send(fakeError);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
