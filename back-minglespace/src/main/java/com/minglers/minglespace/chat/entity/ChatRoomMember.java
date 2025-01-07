package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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

    @CreationTimestamp
    private LocalDateTime date;

    @Enumerated(EnumType.STRING)
    private ChatRole chatRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatroom_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wsmember_id")
    private WSMember wsMember;

    @Builder.Default
    private boolean isLeft = false;

    public ChatRoomMemberDTO toDTO(){
        User user = this.getWsMember().getUser();
        String uriPath = user.getImage() != null ? user.getImage().getUripath() : "";
        Long wsMemberId = (this.getWsMember() != null)  ? this.getWsMember().getId() : 0L;

        ChatRoomMemberDTO dto = ChatRoomMemberDTO.builder()
                .wsMemberId(wsMemberId)
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
