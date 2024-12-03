package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chatmessage")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;

    private Timestamp date;

    @ManyToOne(fetch = FetchType.LAZY)
    private WSMember wsMember;

    @ManyToOne(fetch = FetchType.LAZY)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replyid")
    private ChatMessage parentMessage;

}
