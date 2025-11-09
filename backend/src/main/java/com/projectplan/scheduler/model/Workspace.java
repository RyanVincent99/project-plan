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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "workspace", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<UserWorkspace> userWorkspaces = new HashSet<>();
}
