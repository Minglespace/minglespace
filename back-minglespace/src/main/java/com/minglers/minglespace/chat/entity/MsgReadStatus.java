package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.common.converter.LocalDateTimeAttributeConverter;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "message_read_status")
public class MsgReadStatus {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "chatMessage_id")
  private ChatMessage message;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wsMember_id")
  private WSMember wsMember;

  //불필요시 삭제
  @Builder.Default
  private boolean isRead = false;

  //불필요시 삭제
  @Convert(converter = LocalDateTimeAttributeConverter.class)
  private LocalDateTime readTime;
}
