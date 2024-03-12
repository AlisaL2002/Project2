const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;      // localhost port number

app.use(bodyParser.json());

const postsFilePath = path.join(__dirname, 'posts.json');

// This fucntion reads postsfunction
const readPostsSync = () => {
  try {
    const postsData = fs.readFileSync(postsFilePath);
    return JSON.parse(postsData);
  } catch (error) {
    return [];
  }
};

// Saves posts function
const savePostsSync = (posts) => {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2));
};

// Routes to be tested in postman:

// GET /posts - Returns an array of posts
app.get('/posts', (req, res) => {
    const posts = readPostsSync();
    res.json(posts);
  });

// GET /post/author/:author - Returns an array of posts by a given author
app.get('/post/author/:author', (req, res) => {
    const { author } = req.params;
    const posts = readPostsSync().filter(post => post.author === author);
    res.json(posts);
  });

// GET /post/postId/:postId - Retrieves a single post object
app.get('/post/postId/:postId', (req, res) => {
    const { postId } = req.params;
    const posts = readPostsSync();
    const post = posts.find(post => post.postId === postId);
    res.json(post || {});
  });

// Adding a New Post
  app.post('/post', (req, res) => {
    const newPost = req.body;
    const posts = readPostsSync();
    posts.push({ ...newPost, comments: [] });
    savePostsSync(posts);
    res.status(201).send('Post added');
  });  

// Dleting a post
// DELETE /post/:postId - Removes the post from the array.
app.delete('/post/:postId', (req, res) => {
  let posts = readPostsSync();
  const { postId } = req.params;
  posts = posts.filter(post => post.postId !== postId);
  savePostsSync(posts);
  res.send('Post deleted');
});

// Getting comment for a post

app.get('/post/:postId/comments', (req, res) => {
    const { postId } = req.params;
    const posts = readPostsSync();
    const post = posts.find(post => post.postId === postId);
    res.json(post ? post.comments : []);
  });

  // POST /post/:postId/comment - Adds a comment to the end of the post and returns an ID
  // Adding Comment to a Post
  app.post('/post/:postId/comment', (req, res) => {
    const { postId } = req.params;
    const newComment = req.body;
    const posts = readPostsSync();
    const post = posts.find(post => post.postId === postId);
    if (post) {
      post.comments.push(newComment); // Ensure newComment includes all required fields
      savePostsSync(posts);
      res.status(201).send('Comment added');
    } else {
      res.status(404).send('Post not found');
    }
  });

// DELETE /post/:postId/comment/:commentId - Deletes the comment with the provided id
// Deleting a comment
  app.delete('/post/:postId/comment/:commentId', (req, res) => {
    const { postId, commentId } = req.params;
    const posts = readPostsSync();
    const post = posts.find(post => post.postId === postId);
    if (post) {
      post.comments = post.comments.filter(comment => comment.commentId !== commentId);
      savePostsSync(posts);
      res.send('Comment deleted');
    } else {
      res.status(404).send('Post not found');
    }
  });
  