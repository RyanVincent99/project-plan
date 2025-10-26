package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateCommentRequest;
import com.projectplan.scheduler.dto.CreatePostRequest;
import com.projectplan.scheduler.dto.UpdateStatusRequest;
import com.projectplan.scheduler.model.Comment;
import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.PostStatus;
import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.repository.CommentRepository;
import com.projectplan.scheduler.repository.PostRepository;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import com.projectplan.scheduler.service.PublishingService; // Import the new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Required for List
import java.util.Set;   // Required for Set

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private SocialAccountRepository socialAccountRepository; // Inject new repo

    @Autowired
    private PublishingService publishingService; // Inject PublishingService

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(posts);
    }

    // UPDATED createPost method
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody CreatePostRequest request) {
        Post post = new Post();
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setScheduledAt(request.getScheduledAt());
        post.setStatus(PostStatus.DRAFT);
        
        // Add logic to find and set target accounts
        if (request.getTargetAccountIds() != null && !request.getTargetAccountIds().isEmpty()) {
            List<SocialAccount> accounts = socialAccountRepository.findAllById(request.getTargetAccountIds());
            post.setTargets(Set.copyOf(accounts));
        }

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

    /**
     * Publishes a post to its target social media channels.
     * @param postId The ID of the post to publish.
     * @return The updated post with status PUBLISHED.
     */
    @PostMapping("/{postId}/publish")
    public ResponseEntity<Post> publishPost(@PathVariable String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Use the service to handle the publishing logic
        publishingService.publishPost(post);

        // Update the post's status to PUBLISHED
        post.setStatus(PostStatus.PUBLISHED);
        Post updatedPost = postRepository.save(post);

        return ResponseEntity.ok(updatedPost);
    }

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