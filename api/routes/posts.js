const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();

const Post = require('../models/post');

module.exports = function(app){
const ensureAuth = require('../middlewares/ensureAuth')(app);

router.get('/', (req, res) => {
    Post.find()
        .populate('_createdBy', 'name lastname -_id')
        .select('-__v')
        .exec()
        .then(docs =>  {
            const response = {
                count: docs.length,
                posts: docs.map(doc => {
                    return {
                        title: doc.title,
                        text: doc.text,
                        _createdAt: doc._createdAt,
                        _createdBy:doc._createdBy,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:30004/posts/'+doc._id
                        }
                    }
                })
            }
            console.log(docs);
            if (docs.length >0){
                res.status(200).json({
                    response
                })
            } else {
                res.status(200).json({
                    message: 'No posts found'
                })
            }
            
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
});
router.get('/srch/:param', (req, res) =>{
    const param = req.params.param
    console.log(param)
    Post.find({'title': { $regex: '.*' + param + '.*' }})
    .populate('_createdBy', 'name lastname -_id')
    .select('-__v')
    .exec()
    .then(docs =>  {
        const response = {
            count: docs.length,
            posts: docs.map(doc => {
                return {
                    title: doc.title,
                    text: doc.text,
                    _createdAt: doc._createdAt,
                    _createdBy:doc._createdBy,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:30004/posts/'+doc._id
                    }
                }
            })
        }
        console.log(docs);
        if (docs.length >0){
            res.status(200).json({
                response
            })
        } else {
            res.status(200).json({
                message: 'No posts found'
            })
        }
        
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', ensureAuth, (req, res) => {
    const {
        title,
        text
    } = req.body
    const uid = req.user.userId;
    console.log(uid);
    const newPost = new Post({
        _id: new mongoose.Types.ObjectId(),
        title: title,
        text: text,
        _createdBy:uid
    });

    newPost.save()
        .then(rez => {
            res.status(200).json({
                message: 'Post created',
                createdPost: {
                    title: newPost.title,
                    text: newPost.text,
                    _id: newPost._id,
                    _createdBy:newPost._createdBy,
                    request: {
                        type: 'GET',
                            url: 'http://localhost:30004/posts/'+newPost._id
                    }
                }
            });
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({error: err})
        });
    
});

router.get('/:postId', (req, res) => {
    const id = req.params.postId;
    Post.findById(id)
        .select('-__v')
        .populate('comments', 'text createdAt -_id')
        .populate('_createdBy', 'name lastname -_id')
        .exec()
        .then(doc => {
            console.log(doc);
            if(doc) {
                res.status(200).json({
                    post: doc,
                    request: {
                        type: 'GET',
                        url:'http://localhost:30004/comments/add/'+doc._id
                    },
                    DeleteRequest: {
                        type: 'DEL',
                        url:'http://localhost:30004/posts/'+doc._id
                    }
                })
            } else {
                res.status(404).json({message: 'wrong id'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
    
})


router.patch('/:postId', ensureAuth, (req, res) => {
    const id = req.params.postId;
    const updatePost = {};
    Post.find({
        _id: id,
        _createdBy: req.user.userId
    })
        .exec()
        .then( result1 =>{
            if(result1){
                for(const part of req.body) {
                    updatePost[part.propName] = part.value;
                }
                Post.update({_id: id}, {$set: updatePost })
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: 'Post updated',
                            request: {
                                type: 'GET',
                                url: 'http://localhost:30004/posts/'+id
                            }
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        }) 
                    })
            } else {
                res.status(400).json({
                    message: 'not allowed'
                })
            }
            
        })
    
})

router.delete('/:postId', ensureAuth, (req, res) => {
    const id = req.params.postId;
    Post.find({
        _id: id,
        _createdBy: req.user.userId
    })
        .exec()
        .then( result1 =>{
            if(result1) {
                Post.remove({_id: id})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: 'Post deleted',
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    })
            }  else {
                res.status(400).json({
                    message: 'not allowed'
                })
            }
        })
})
    return router;
}
