package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.service.ChatMessageService;
import com.minglers.minglespace.chat.service.MsgReadStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Set;


@Controller
@Log4j2
@RequiredArgsConstructor
public class ChatMessageController {
  private final ChatMessageService chatMessageService;
  private final MsgReadStatusService msgReadStatusService;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final StompInterceptor stompInterceptor;

  @MessageMapping("/messages/{chatRoomId}")
  @SendTo("/topic/chatRooms/{chatRoomId}/msg")
  public ChatMessageDTO saveAndSendChatMessage(@DestinationVariable Long chatRoomId,
                                               ChatMessageDTO messageDTO,
                                               StompHeaderAccessor headerAccessor) {
    Long writerUserId = (Long) headerAccessor.getSessionAttributes().get("userId");

    if (writerUserId == null) {
      log.error("user ID not found in websocket session");
      return null;
    }
    log.info("received message : " + messageDTO.getContent() + " from " + messageDTO.getWorkspaceId());

    try {
      messageDTO.setChatRoomId(chatRoomId);

      Set<Long> activeUserId = stompInterceptor.getActiveUsersForSubscription("/topic/chatRooms/"+chatRoomId+"/msg");

      ChatMessageDTO savedMsgDTO = chatMessageService.saveMessage(messageDTO, writerUserId, activeUserId);

      //안읽은 메시지 처리를 위해 채팅 목록에 보내기
      simpMessagingTemplate.convertAndSend("/topic/workspaces/" + messageDTO.getWorkspaceId(), savedMsgDTO);


      return savedMsgDTO;
    } catch (Exception e) {
      log.error("메시지 저장 중 오류 발생: ", e);
//            String sessionId = stompInterceptor.getSessionForUser(writerUserId);
      //예외 발생 시 클라이언트에게 오류 메시지 발송
//            simpMessagingTemplate.convertAndSendToUser(
//                    writerUserId.toString(), "/queue/errors", "Error saving message: "+e.getMessage()
//            );
      return null;
    }
  }
}
