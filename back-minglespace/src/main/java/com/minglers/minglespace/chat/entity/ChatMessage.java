package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.auth.type.WithdrawalType;
import com.minglers.minglespace.chat.dto.ChatMsgResponseDTO;
import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "ws_member_id")
  @OnDelete(action = OnDeleteAction.SET_NULL)
  private WSMember wsMember;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chatroom_id", nullable = false)
  private ChatRoom chatRoom;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "replyid")
  private ChatMessage parentMessage;

  @Convert(converter = LocalDateTimeAttributeConverter.class)
  private LocalDateTime date;

  @Builder.Default
  private Boolean isAnnouncement = false;

  @Builder.Default
  private Boolean isDeleted = false;

  @OneToMany(mappedBy = "chatMessage", orphanRemoval = true, cascade = CascadeType.ALL)
  @Builder.Default
  private List<Image> images = new ArrayList<>();

  @OneToMany(mappedBy = "message", orphanRemoval = true, cascade = CascadeType.ALL)
  @Builder.Default
  private List<MsgReadStatus> msgReadStatuses = new ArrayList<>();

  public void addImage(Image image) {
    images.add(image);
    image.setChatMessage(this);
  }

  private boolean isImage(String fileExtension) {
    return fileExtension != null && (fileExtension.equalsIgnoreCase("jpg") || fileExtension.equalsIgnoreCase("jpeg") || fileExtension.equalsIgnoreCase("png"));
  }

  private String getFileExtension(String fileName) {
    if (fileName != null && fileName.contains(".")) {
      return fileName.substring(fileName.lastIndexOf('.') + 1);
    }
    return "";
  }

  public ChatMsgResponseDTO toDTO(List<MemberWithUserInfoDTO> unReadMembers) {
    Long replyId = (this.getParentMessage() != null) ? this.getParentMessage().getId() : null;

    List<String> imageUriPaths = this.getImages().stream()
            .filter(image -> isImage(getFileExtension(image.getOriginalname())))
            .map(Image::getUripath)
            .toList();

    List<String> documentUriPaths = this.getImages().stream()
            .filter(image -> !isImage(getFileExtension(image.getOriginalname())))
            .map(Image::getUripath)
            .toList();

    String senderName = (this.getWsMember() != null && this.getWsMember().getUser().getWithdrawalType() == WithdrawalType.NOT)
            ? this.getWsMember().getUser().getName() : "(알 수 없음)";

    Long writerWsMemberId = (this.getWsMember() != null)  ? this.getWsMember().getId() : 0L;

    return ChatMsgResponseDTO.builder()
            .id(this.getId())
            .chatRoomId(this.getChatRoom().getId())
            .date(this.getDate())
            .content(this.getContent())
            .replyId(replyId)
            .writerWsMemberId(writerWsMemberId)
            .isAnnouncement(this.getIsAnnouncement())
            .sender(senderName)
            .unReadMembers(unReadMembers)
            .imageUriPaths(imageUriPaths)
            .documentUriPaths(documentUriPaths)
            .build();
  }
}
