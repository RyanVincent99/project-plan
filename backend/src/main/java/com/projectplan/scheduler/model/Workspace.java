package com.projectplan.scheduler.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "\"Workspace\"")
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "\"UserWorkspace\"",
            joinColumns = @JoinColumn(name = "workspaceId"),
            inverseJoinColumns = @JoinColumn(name = "userId")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<User> users = new HashSet<>();
}
