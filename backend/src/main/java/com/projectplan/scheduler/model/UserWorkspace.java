package com.projectplan.scheduler.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "\"UserWorkspace\"")
public class UserWorkspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "userId")
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspaceId")
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    private UserRole role;
}
