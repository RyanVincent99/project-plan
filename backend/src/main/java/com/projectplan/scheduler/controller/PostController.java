package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateCommentRequest;
import com.projectplan.scheduler.dto.CreatePostRequest;
import com.projectplan.scheduler.dto.UpdatePostRequest;
import com.projectplan.scheduler.dto.UpdateStatusRequest;
import com.projectplan.scheduler.model.Comment;
import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.PostStatus;
import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.model.Workspace;
import com.projectplan.scheduler.repository.CommentRepository;
import com.projectplan.scheduler.repository.PostRepository;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import com.projectplan.scheduler.repository.WorkspaceRepository;
import com.projectplan.scheduler.service.PublishingService; // Import the new service
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
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
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private PublishingService publishingService; // Inject PublishingService

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts(@RequestParam Long workspaceId) {
        List<Post> posts = postRepository.findAllByWorkspaceIdAndStatusNot(workspaceId, PostStatus.ARCHIVED, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/archived")
    public ResponseEntity<List<Post>> getArchivedPosts(@RequestParam Long workspaceId) {
        List<Post> posts = postRepository.findAllByWorkspaceIdAndStatus(workspaceId, PostStatus.ARCHIVED, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(posts);
    }

    // UPDATED createPost method
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody CreatePostRequest request) {
        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        Post post = new Post();
        post.setContent(request.getContent());
        post.setAuthorId(request.getAuthorId());
        post.setScheduledAt(request.getScheduledAt());
        post.setStatus(PostStatus.DRAFT);
        post.setWorkspace(workspace);
        
        // Add logic to find and set target accounts
        if (request.getTargetAccountIds() != null && !request.getTargetAccountIds().isEmpty()) {
            List<Long> targetAccountIds = request.getTargetAccountIds().stream()
                    .map(Long::parseLong)
                    .toList();
            List<SocialAccount> accounts = socialAccountRepository.findAllById(targetAccountIds);
            post.setTargets(new HashSet<>(accounts));
        }

        Post savedPost = postRepository.save(post);
        return ResponseEntity.status(201).body(savedPost);
    }

    @PutMapping("/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId, @RequestBody UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        String originalContent = post.getContent();
        PostStatus originalStatus = post.getStatus();

        // Update content
        post.setContent(request.getContent());
        post.setScheduledAt(request.getScheduledAt());

        // Update targets
        if (request.getTargetAccountIds() != null) {
            List<Long> targetAccountIds = request.getTargetAccountIds().stream()
                    .map(Long::parseLong)
                    .toList();
            List<SocialAccount> accounts = socialAccountRepository.findAllById(targetAccountIds);
            post.setTargets(new HashSet<>(accounts));
        }

        // Revert status to DRAFT if it was PUBLISHED and content changed
        if (originalStatus == PostStatus.PUBLISHED && !originalContent.equals(request.getContent())) {
            post.setStatus(PostStatus.DRAFT);
        }

        // Update status based on scheduling, but don't override a revert to DRAFT
        if (post.getStatus() != PostStatus.DRAFT) {
            if (post.getScheduledAt() != null) {
                if (post.getStatus() == PostStatus.APPROVED) {
                    post.setStatus(PostStatus.SCHEDULED);
                }
            } else { // scheduledAt is null
                if (post.getStatus() == PostStatus.SCHEDULED) {
                    post.setStatus(PostStatus.APPROVED);
                }
            }
        }

        Post updatedPost = postRepository.save(post);
        return ResponseEntity.ok(updatedPost);
    }

    @PutMapping("/{postId}/status")
    public ResponseEntity<Post> updatePostStatus(
            @PathVariable Long postId,
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
    public ResponseEntity<?> publishPost(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        try {
            // Use the service to handle the publishing logic
            publishingService.publishPost(post);

            // Update the post's status to PUBLISHED
            post.setStatus(PostStatus.PUBLISHED);
            Post updatedPost = postRepository.save(post);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        if (!postRepository.existsById(postId)) {
            return ResponseEntity.notFound().build();
        }
        postRepository.deleteById(postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> createComment(
            @PathVariable Long postId,
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