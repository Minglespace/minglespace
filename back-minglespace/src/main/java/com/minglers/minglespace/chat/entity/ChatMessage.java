package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chatmessage")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;

    //message 보낸 유저
    @ManyToOne(fetch = FetchType.LAZY)
    private WSMember wsMember;

    @ManyToOne(fetch = FetchType.LAZY)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replyid")
    private ChatMessage parentMessage;

//    private Timestamp date;
    @Convert(converter = LocalDateTimeAttributeConverter.class)
    private LocalDateTime date;

    @Builder.Default
    private Boolean isAnnouncement = false;
}
