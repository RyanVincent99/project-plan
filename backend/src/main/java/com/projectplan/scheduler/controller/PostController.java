package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateCommentRequest;
import com.projectplan.scheduler.dto.CreatePostRequest;
import com.projectplan.scheduler.dto.UpdateStatusRequest;
import com.projectplan.scheduler.model.Comment;
import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.PostStatus;
import com.projectplan.scheduler.repository.CommentRepository;
import com.projectplan.scheduler.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository; // Inject comment repository

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        // Sort by creation date, newest first
        List<Post> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(posts);
    }

    // NEW ENDPOINT: Create Post
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody CreatePostRequest request) {
        Post post = new Post();
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setScheduledAt(request.getScheduledAt());
        post.setStatus(PostStatus.DRAFT); // Default status
        
        Post savedPost = postRepository.save(post);
        return ResponseEntity.status(201).body(savedPost);
    }

    @PutMapping("/{postId}/status")
    public ResponseEntity<Post> updatePostStatus(
            @PathVariable String postId,
            @RequestBody UpdateStatusRequest request) {
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        post.setStatus(request.getStatus());
        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(updatedPost);
    }

    // NEW ENDPOINT: Create Comment
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> createComment(
            @PathVariable String postId,
            @RequestBody CreateCommentRequest request) {
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        
        Comment comment = new Comment();
        comment.setText(request.getText());
        comment.setAuthorId(request.getAuthorId());
        comment.setPost(post);
        
        Comment savedComment = commentRepository.save(comment);
        return ResponseEntity.status(201).body(savedComment);
    }
}