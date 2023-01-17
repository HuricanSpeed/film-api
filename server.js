const express = require('express');
const app = express();

app.use(express.json());

const netflixRouter = require('./routes/netflix')

app.use('/netflix', netflixRouter)

app.listen(3000, () => console.log('Server running on port 3000'));