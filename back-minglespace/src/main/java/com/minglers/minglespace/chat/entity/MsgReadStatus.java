package com.minglers.minglespace.chat.entity;

import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;

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
  @JoinColumn(name = "chatMessage_id", nullable = false)
  private ChatMessage message;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "wsMember_id", nullable = false)
  private WSMember wsMember;
}
