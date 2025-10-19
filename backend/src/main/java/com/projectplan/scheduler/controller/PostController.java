package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.UpdateStatusRequest;
import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts") 
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postRepository.findAll(); 
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{postId}/status")
    public ResponseEntity<Post> updatePostStatus(
            @PathVariable String postId,
            @RequestBody UpdateStatusRequest request) {
        
        // This is the fixed line:
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId)); // Removed the 'D'
        
        post.setStatus(request.getStatus());
        
        Post updatedPost = postRepository.save(post);
        
        return ResponseEntity.ok(updatedPost);
    }
}