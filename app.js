const express = require('express');
const app = express();
const morgan = require('morgan');
const bp = require('body-parser');
const mongoose = require('mongoose');

app.set('JWT_Key', 'secret');

const postRoutes = require('./api/routes/posts')(app);
const commentRoutes = require('./api/routes/comments')(app);
const userRoutes = require('./api/routes/users')(app);

mongoose.connect('mongodb://localhost:27017/sForum', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-methods', 'PUT, PATCH, POST, DELETE, DELETE, GET');
        return res.status(200).json({});
    }
    next(); 
});

app.use('/posts', postRoutes);
app.use('/comment', commentRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status= 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;
