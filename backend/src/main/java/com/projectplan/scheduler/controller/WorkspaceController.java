package com.projectplan.scheduler.controller;

import com.projectplan.scheduler.dto.CreateWorkspaceRequest;
import com.projectplan.scheduler.dto.InviteUserRequest;
import com.projectplan.scheduler.dto.UpdateUserRoleRequest;
import com.projectplan.scheduler.dto.UpdateWorkspaceRequest;
import com.projectplan.scheduler.model.User;
import com.projectplan.scheduler.model.UserRole;
import com.projectplan.scheduler.model.UserWorkspace;
import com.projectplan.scheduler.model.Workspace;
import com.projectplan.scheduler.repository.PostRepository;
import com.projectplan.scheduler.repository.SocialAccountRepository;
import com.projectplan.scheduler.repository.UserRepository;
import com.projectplan.scheduler.repository.UserWorkspaceRepository;
import com.projectplan.scheduler.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @Autowired
    private UserWorkspaceRepository userWorkspaceRepository;

    @GetMapping
    @Transactional
    public ResponseEntity<List<Workspace>> getWorkspacesForUser(
            @RequestParam String userId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String image) {
        // Find user or create if they don't exist in our backend yet
        User user = userRepository.findById(userId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(userId);
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setImage(image);
            return userRepository.save(newUser);
        });

        // If user exists, but details are missing, update them
        if ((user.getName() == null && name != null) || (user.getEmail() == null && email != null)) {
            user.setName(name);
            user.setEmail(email);
            user.setImage(image);
            userRepository.save(user);
        }

        List<Workspace> workspaces = workspaceRepository.findByUserWorkspaces_User_Id(userId);

        // If the user has no workspaces, create a default one
        if (workspaces.isEmpty()) {
            Workspace newWorkspace = new Workspace();
            newWorkspace.setName("My First Workspace");

            UserWorkspace userWorkspace = new UserWorkspace();
            userWorkspace.setUser(user);
            userWorkspace.setWorkspace(newWorkspace);
            userWorkspace.setRole(UserRole.ADMINISTRATOR);

            newWorkspace.getUserWorkspaces().add(userWorkspace);
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

        UserWorkspace userWorkspace = new UserWorkspace();
        userWorkspace.setUser(user);
        userWorkspace.setWorkspace(newWorkspace);
        userWorkspace.setRole(UserRole.ADMINISTRATOR);

        newWorkspace.getUserWorkspaces().add(userWorkspace);

        Workspace savedWorkspace = workspaceRepository.save(newWorkspace);
        return ResponseEntity.status(201).body(savedWorkspace);
    }

    @PutMapping("/{workspaceId}")
    @Transactional
    public ResponseEntity<Workspace> updateWorkspace(@PathVariable String workspaceId, @RequestBody UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found with id: " + workspaceId));

        // Permission check
        boolean isAdmin = workspace.getUserWorkspaces().stream()
                .anyMatch(uw -> uw.getUser().getId().equals(request.getUserId()) && uw.getRole() == UserRole.ADMINISTRATOR);

        if (!isAdmin) {
            return ResponseEntity.status(403).build(); // Forbidden
        }

        workspace.setName(request.getName());
        Workspace updatedWorkspace = workspaceRepository.save(workspace);
        return ResponseEntity.ok(updatedWorkspace);
    }

    @PostMapping("/{workspaceId}/members")
    @Transactional
    public ResponseEntity<UserWorkspace> inviteUserToWorkspace(@PathVariable String workspaceId, @RequestBody InviteUserRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 1. Check if inviter is an admin
        boolean isInviterAdmin = workspace.getUserWorkspaces().stream()
                .anyMatch(uw -> uw.getUser().getId().equals(request.getInviterUserId()) && uw.getRole() == UserRole.ADMINISTRATOR);
        if (!isInviterAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 2. Find user to invite
        User userToInvite = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User with email " + request.getEmail() + " not found."));

        // 3. Check if user is already a member
        boolean isAlreadyMember = workspace.getUserWorkspaces().stream()
                .anyMatch(uw -> uw.getUser().getId().equals(userToInvite.getId()));
        if (isAlreadyMember) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // Conflict
        }

        // 4. Create and save the new membership
        UserWorkspace newUserWorkspace = new UserWorkspace();
        newUserWorkspace.setUser(userToInvite);
        newUserWorkspace.setWorkspace(workspace);
        newUserWorkspace.setRole(request.getRole());

        UserWorkspace savedUserWorkspace = userWorkspaceRepository.save(newUserWorkspace);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUserWorkspace);
    }

    @PutMapping("/{workspaceId}/members/{memberUserId}")
    @Transactional
    public ResponseEntity<Object> updateUserRole(@PathVariable String workspaceId, @PathVariable String memberUserId, @RequestBody UpdateUserRoleRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 1. Check if requester is an admin
        boolean isAdmin = workspace.getUserWorkspaces().stream()
                .anyMatch(uw -> uw.getUser().getId().equals(request.getAdminUserId()) && uw.getRole() == UserRole.ADMINISTRATOR);
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 2. Find the membership to update
        UserWorkspace userWorkspaceToUpdate = userWorkspaceRepository.findByUser_IdAndWorkspace_Id(memberUserId, workspaceId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this workspace"));

        // 3. Prevent removing the last admin
        if (userWorkspaceToUpdate.getRole() == UserRole.ADMINISTRATOR && request.getRole() != UserRole.ADMINISTRATOR) {
            long adminCount = workspace.getUserWorkspaces().stream()
                    .filter(uw -> uw.getRole() == UserRole.ADMINISTRATOR)
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "You cannot demote the last administrator."));
            }
        }

        // 4. Update and save
        userWorkspaceToUpdate.setRole(request.getRole());
        UserWorkspace updatedUserWorkspace = userWorkspaceRepository.save(userWorkspaceToUpdate);
        return ResponseEntity.ok(updatedUserWorkspace);
    }

    @DeleteMapping("/{workspaceId}/members/{memberUserId}")
    @Transactional
    public ResponseEntity<Object> removeUserFromWorkspace(@PathVariable String workspaceId, @PathVariable String memberUserId, @RequestParam String adminUserId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 1. Check if requester is an admin
        boolean isAdmin = workspace.getUserWorkspaces().stream()
                .anyMatch(uw -> uw.getUser().getId().equals(adminUserId) && uw.getRole() == UserRole.ADMINISTRATOR);
        if (!isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 2. Find the membership to delete
        UserWorkspace userWorkspaceToRemove = userWorkspaceRepository.findByUser_IdAndWorkspace_Id(memberUserId, workspaceId)
                .orElseThrow(() -> new RuntimeException("User is not a member of this workspace"));

        // 3. Prevent removing the last admin
        if (userWorkspaceToRemove.getRole() == UserRole.ADMINISTRATOR) {
            long adminCount = workspace.getUserWorkspaces().stream()
                    .filter(uw -> uw.getRole() == UserRole.ADMINISTRATOR)
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "You cannot remove the last administrator from a workspace."));
            }
        }
        
        // 4. An admin cannot remove themselves
        if (memberUserId.equals(adminUserId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Administrators cannot remove themselves from a workspace."));
        }

        // 5. Delete the membership
        userWorkspaceRepository.deleteById(userWorkspaceToRemove.getId());
        return ResponseEntity.noContent().build();
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
        userWorkspaceRepository.deleteByWorkspaceId(workspaceId);

        // Now delete the workspace
        workspaceRepository.deleteById(workspaceId);

        return ResponseEntity.noContent().build();
    }
}
