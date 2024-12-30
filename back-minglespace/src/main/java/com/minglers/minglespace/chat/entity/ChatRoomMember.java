package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.role.ChatRole;
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
@Table(name = "chatroommember", uniqueConstraints = { @UniqueConstraint(columnNames = {"chatroom_id", "wsmember_id"}) })
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    private Timestamp joined_at;
    @Convert(converter = LocalDateTimeAttributeConverter.class)
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private ChatRole chatRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatroom_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wsmember_id", nullable = false)
    private WSMember wsMember;

    @Builder.Default
    private boolean isLeft = false;

    public ChatRoomMemberDTO toDTO(){
        User user = this.getWsMember().getUser();
        String uriPath = user.getImage() != null ? user.getImage().getUripath() : "";
        ChatRoomMemberDTO dto = ChatRoomMemberDTO.builder()
                .wsMemberId(this.getWsMember().getId())
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .imageUriPath(uriPath)
                .position(user.getPosition())
                .build();
        dto.setChatRole(this.getChatRole());
        return dto;
    }
}
