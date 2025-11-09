package com.projectplan.scheduler.repository;

import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.PostStatus;
import com.projectplan.scheduler.model.SocialAccount;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByStatusNot(PostStatus status, Sort sort);
    List<Post> findAllByStatus(PostStatus status, Sort sort);
    List<Post> findAllByTargetsContains(SocialAccount socialAccount);
    List<Post> findAllByWorkspaceIdAndStatusNot(Long workspaceId, PostStatus status, Sort sort);
    List<Post> findAllByWorkspaceIdAndStatus(Long workspaceId, PostStatus status, Sort sort);
    void deleteByWorkspaceId(Long workspaceId);
}