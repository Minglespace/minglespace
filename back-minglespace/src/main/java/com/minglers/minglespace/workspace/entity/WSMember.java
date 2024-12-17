package com.minglers.minglespace.workspace.entity;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.todo.entity.Todo;
import com.minglers.minglespace.todo.entity.TodoAssignee;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "wsmember", uniqueConstraints = { @UniqueConstraint(columnNames = {"workspace_id", "user_id"}) })
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"workSpace", "todoList"})
@Getter
@Builder
public class WSMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'LEADER'")
    @Column(name = "role", nullable = false)
    private WSMemberRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private WorkSpace workSpace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "wsMember", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatRoomMember> chatRoomMembers = new ArrayList<>();

    @OneToMany(mappedBy = "wsMember", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Todo> todoList ;

    @OneToMany(mappedBy = "wsMember", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TodoAssignee> todoAssignees ;

    public void addChatRoomMember(ChatRoomMember chatRoomMember){
        chatRoomMembers.add(chatRoomMember);
        chatRoomMember.setWsMember(this);
    }
    public void changeRole(WSMemberRole role) {
        this.role = role;
    }
}

