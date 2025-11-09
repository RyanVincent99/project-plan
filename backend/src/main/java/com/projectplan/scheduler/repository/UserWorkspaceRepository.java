package com.projectplan.scheduler.repository;

import com.projectplan.scheduler.model.UserWorkspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserWorkspaceRepository extends JpaRepository<UserWorkspace, Long> {
    void deleteByWorkspaceId(Long workspaceId);
    Optional<UserWorkspace> findByUser_IdAndWorkspace_Id(String userId, Long workspaceId);
}
