package com.projectplan.scheduler.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
// This table name must match the one created by Prisma for NextAuth
@Table(name = "\"User\"")
public class User {

    @Id
    private String id; // This ID comes from NextAuth, not auto-generated

    private String name;

    private String email;

    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    @JsonIgnore // Prevents infinite loops during serialization
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Workspace> workspaces = new HashSet<>();
}
