package com.example.projectplan.controller;

import com.example.projectplan.model.Post;
import com.example.projectplan.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostRepository repo;

    public PostController(PostRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Post> all() {
        return repo.findAll();
    }

    @PostMapping
    public Post create(@RequestBody Post p) {
        return repo.save(p);
    }
}
