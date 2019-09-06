const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

const User = require('../models/user');

module.exports = function(app){
const ensureAuth = require('../middlewares/ensureAuth')(app);
router.post('/register', (req, res)=>{
    const {
        email,
        name,
        lastname,
        password,
        tos
    } = req.body
    bcrypt.hash(password, 10, (err, hash) => {
        if(err) {
            return res.status(500).json({
                error: err
            })
        } else{
            const newUser = new User({
                _id: new mongoose.Types.ObjectId(),
                email: email,
                name: name,
                lastname: lastname,
                password: hash,
                ToS: tos
            })
            newUser.save()
                    .then(response =>{
                        console.log(response)
                        res.status(201).json({
                           response,
                            message: 'User created'
                        })
                    })
                    .catch(err => {
                            console.log(err)
                            res.status(500).json({
                                error: err
                            })
                        })              
        }
    })
});

router.post('/login', (req, res) => {
    const {
        email,
        password
    } = req.body

    User.find({email: email})
        .exec()
        .then(users => {
            const JWT=app.get('JWT_Key')
            if(users.length < 1) {
                return res.status(401).json({
                    message: 'Login failed email'
                });
            }
            bcrypt.compare(password, users[0].password, (err, result) => {
                if(err) {
                    return res.status(401).json({
                        message: 'Login failed pass'
                    });
                }
                if(result) {
                    const token = jwt.sign({
                        email: users[0].email,
                        userId: users[0]._id
                    },
                    JWT,
                    {
                        expiresIn: '1h'
                    })
                    console.log(token);
                    return res.status(200).json({
                        message: 'You have been loged in',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Login failed somethin else'
                })
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.delete('/:uid', (req, res) => {
    User.remove({_id: req.params.uid})
        .exec()
        .then(resp => {
            res.status(200).json({
                message: 'user is deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})
router.post('/test', ensureAuth, (req, res)=>{
    res.status(200).json({
        message: 'ok'
    })
})

     console.log(app.get('JWT_Key'));
    return router;
};