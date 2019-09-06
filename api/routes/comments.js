const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Comment = require('../models/comment');
const Post = require('../models/post')

module.exports = function(app){
const ensureAuth = require('../middlewares/ensureAuth')(app);

    router.post('/add/:pid', ensureAuth, (req, res) => {
    const pid = req.params.pid;

    const { 
        userId = req.user.userId,
        text,
        postId,
    } = req.body;
    Post.findById(postId)
        .then(post => {
            const comment = new Comment({
                _id: mongoose.Types.ObjectId(),
                text: text,
                post: postId,
                _createdBy: userId
            })
            return comment.save()
                
        }).then(result => {
            Post.findByIdAndUpdate(
                postId,
                {$push: {
                    'comments': result._id
                }}
            ).then((postComment) => {
                res.status(200).json({
                    message: 'Comment created',
                    createdComment : {
                    id: result._id,
                    text: result.text,
                    atPost: result.post
                    },
                    request: {
                        type: 'GET',
                        url: 'http://localhost:30004/comment/'+result._id
                    },
                    postComment
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'An error has occured, please check if the given post id valid',
                error: err
            })
        });
})
router.get('/srch/:param', (req, res) =>{
    const param = req.params.param
    console.log(param)
    Comment.find({'text': { $regex: '.*' + param + '.*' }})
        .select('-__v')
        .populate('_createdBy', 'name lastname -__id')
        .exec()
        .then(docs => {
            res.status(200).json({
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        post: doc.post,
                        text: doc.text,
                        createdAt: doc.createdAt,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:30004/comment/'+doc.id
                        }
                    }
                    
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
})
router.get('/', (req, res) => {
    Comment.find()
        .select('-__v')
        .populate('_createdBy', 'name lastname -__id')
        .exec()
        .then(docs => {
            res.status(200).json({
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        post: doc.post,
                        text: doc.text,
                        createdAt: doc.createdAt,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:30004/comment/'+doc.id
                        }
                    }
                    
                })
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
})
router.get('/:cid', (req, res) => {
    Comment.findById(req.params.cid)
      .select('-__v')
      .populate('_createdBy', 'name lastname -_id')
      .exec()
      .then(comm => {
          res.status(200).json({
              comment: comm,
              reqest: {
                  type: 'DELETE',
                  url: 'http://localhost:30004/comment/'+comm._id
              }
          })
      })
      .catch(err => {
          res.status(500).json({
              message: 'given id could not be found',
              error: err
          })
      })
  })
router.get('/byPosts/:pid', (req, res) => {
    const id = req.params.pid;
    Comment.find({'post': id})
        .exec()
        .then(docs => {
            res.status(200).json(docs)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
})
router.delete('/:cId', ensureAuth,(req, res) => {
    const id = req.params.cId;
    Post.find({
        _id: id,
        _createdBy: req.user.userId
    })
        .exec()
        .then( result1 =>{
            if(result1){
                Comment.remove({_id: id})
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            message: 'Comment deleted',
                        })
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    })
            } else {
                res.status(400).json({
                    message: 'not allowed'
                })
            }
        })
    
})
return router;
}
 