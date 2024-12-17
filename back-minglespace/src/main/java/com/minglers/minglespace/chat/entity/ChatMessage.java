package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

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
    @JoinColumn(name = "chatroom_id")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replyid")
    private ChatMessage parentMessage;

//    private Timestamp date;
    @Convert(converter = LocalDateTimeAttributeConverter.class)
    private LocalDateTime date;

    @Builder.Default
    private Boolean isAnnouncement = false;

    public ChatMessageDTO toDTO(List<MemberWithUserInfoDTO> unReadMembers){
        Long replyId = (this.getParentMessage() != null) ? this.getParentMessage().getId() : null;
        return ChatMessageDTO.builder()
                .id(this.getId())
                .chatRoomId(this.getChatRoom().getId())
                .date(this.getDate())
                .content(this.getContent())
                .replyId(replyId)
                .writerWsMemberId(this.getWsMember().getId())
                .isAnnouncement(this.getIsAnnouncement())
                .sender(this.getWsMember().getUser().getName())
                .unReadMembers(unReadMembers)
                .build();
    }
}
