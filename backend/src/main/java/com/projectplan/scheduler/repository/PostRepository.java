package com.projectplan.scheduler.repository;

import com.projectplan.scheduler.model.Post;
import com.projectplan.scheduler.model.PostStatus;
import com.projectplan.scheduler.model.SocialAccount;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findAllByStatusNot(PostStatus status, Sort sort);
    List<Post> findAllByStatus(PostStatus status, Sort sort);
    List<Post> findAllByTargetsContains(SocialAccount socialAccount);
    List<Post> findAllByWorkspaceIdAndStatusNot(String workspaceId, PostStatus status, Sort sort);
    List<Post> findAllByWorkspaceIdAndStatus(String workspaceId, PostStatus status, Sort sort);
    void deleteByWorkspaceId(String workspaceId);
}