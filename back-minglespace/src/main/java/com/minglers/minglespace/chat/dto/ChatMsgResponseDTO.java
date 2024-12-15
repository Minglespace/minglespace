package com.minglers.minglespace.chat.dto;

import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMsgResponseDTO {
  private Long id;
  private String content;
  private Long writerWsMemberId;
  private Long chatRoomId;
  private Long replyId;
  private LocalDateTime date;
  private Boolean isAnnouncement;
  private String sender;
  private List<MemberWithUserInfoDTO> unReadMembers;//response_안읽은 사람 목록
  private List<String> imageUriPaths; // 이미지 URI 목록
  private List<String> documentUriPaths; // 문서 파일 URI 목록
}
