package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chatroom")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    private Image image;

    @ManyToOne(fetch = FetchType.LAZY)
    private WorkSpace workSpace;

    @Convert(converter = LocalDateTimeAttributeConverter.class)
    private LocalDateTime date;

    //양방향 데이터 조회 쉽도록 list 관리
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatRoomMember> chatRoomMembers = new ArrayList<>();

    //참여 멤버 추가
    public void addChatRoomMember(ChatRoomMember chatRoomMember) {
        chatRoomMembers.add(chatRoomMember);
        chatRoomMember.setChatRoom(this);
    }
}
