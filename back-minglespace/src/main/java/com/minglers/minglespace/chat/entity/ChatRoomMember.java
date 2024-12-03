package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;

import java.sql.Timestamp;

@Entity
@Table(name = "chatroommember", uniqueConstraints = { @UniqueConstraint(columnNames = {"chatroom_id", "wsmember_id"}) })
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Timestamp joined_at;

    @Enumerated(EnumType.STRING)
    private ChatRole chatRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatroom_id")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wsmember_id")
    private WSMember wsMember;
}
