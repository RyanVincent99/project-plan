package com.projectplan.scheduler.repository;

import com.projectplan.scheduler.model.SocialAccount;
import com.projectplan.scheduler.model.SocialAccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Required for this method

@Repository
public interface SocialAccountRepository extends JpaRepository<SocialAccount, String> {
    // This method is used by the OAuthController to find existing accounts
    Optional<SocialAccount> findByProviderAndProviderAccountId(String provider, String providerAccountId);
    List<SocialAccount> findAllByStatus(SocialAccountStatus status);
}