package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateWorkspaceRequest;
import com.projectplan.scheduler.model.User;
import com.projectplan.scheduler.model.Workspace;
import com.projectplan.scheduler.repository.PostRepository;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import com.projectplan.scheduler.repository.UserRepository;
import com.projectplan.scheduler.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SocialAccountRepository socialAccountRepository;

    @GetMapping
    @Transactional
    public ResponseEntity<List<Workspace>> getWorkspacesForUser(@RequestParam String userId) {
        // Find user or create if they don't exist in our backend yet
        User user = userRepository.findById(userId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(userId);
            // In a real app, you might fetch user details from an external service
            return userRepository.save(newUser);
        });

        List<Workspace> workspaces = workspaceRepository.findByUsers_Id(userId);

        // If the user has no workspaces, create a default one
        if (workspaces.isEmpty()) {
            Workspace newWorkspace = new Workspace();
            newWorkspace.setName("New Workspace");
            newWorkspace.getUsers().add(user);
            workspaces.add(workspaceRepository.save(newWorkspace));
        }

        return ResponseEntity.ok(workspaces);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Workspace> createWorkspace(@RequestBody CreateWorkspaceRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        Workspace newWorkspace = new Workspace();
        newWorkspace.setName(request.getName());
        newWorkspace.getUsers().add(user);

        Workspace savedWorkspace = workspaceRepository.save(newWorkspace);
        return ResponseEntity.status(201).body(savedWorkspace);
    }

    @DeleteMapping("/{workspaceId}")
    @Transactional
    public ResponseEntity<Void> deleteWorkspace(@PathVariable String workspaceId) {
        if (!workspaceRepository.existsById(workspaceId)) {
            return ResponseEntity.notFound().build();
        }

        // Delete associated entities first to avoid constraint violations
        postRepository.deleteByWorkspaceId(workspaceId);
        socialAccountRepository.deleteByWorkspaceId(workspaceId);

        // Now delete the workspace
        workspaceRepository.deleteById(workspaceId);

        return ResponseEntity.noContent().build();
    }
}
