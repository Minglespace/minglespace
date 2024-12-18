package com.minglers.minglespace.chat.socket;

import com.minglers.minglespace.chat.config.interceptor.StompInterceptor;
import com.minglers.minglespace.chat.dto.ChatMsgRequestDTO;
import com.minglers.minglespace.chat.dto.ChatMsgResponseDTO;
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
public class ChatMessageWebsocket {
  private final ChatMessageService chatMessageService;
  private final MsgReadStatusService msgReadStatusService;
  private final SimpMessagingTemplate simpMessagingTemplate;
  private final StompInterceptor stompInterceptor;

  @MessageMapping("/messages/{chatRoomId}")
  @SendTo("/topic/chatRooms/{chatRoomId}/msg")
  public ChatMsgResponseDTO saveAndSendChatMessage(@DestinationVariable Long chatRoomId,
                                                   ChatMsgRequestDTO messageDTO,
                                                   StompHeaderAccessor headerAccessor) {
    Long writerUserId = (Long) headerAccessor.getSessionAttributes().get("userId");

    if (writerUserId == null) {
      log.error("user ID not found in websocket session");
      return null;
    }
    log.info("received message : " + messageDTO.getContent() + " from " + messageDTO.getWorkspaceId());

    messageDTO.setChatRoomId(chatRoomId);

    Set<Long> activeUserId = stompInterceptor.getActiveUsersForSubscription("/topic/chatRooms/" + chatRoomId + "/msg");
    ChatMsgResponseDTO savedMsgDTO = chatMessageService.saveMessage(messageDTO, writerUserId, activeUserId);

    //채팅 목록에 메시지 보내기
    simpMessagingTemplate.convertAndSend("/topic/workspaces/" + messageDTO.getWorkspaceId(), savedMsgDTO);
    return savedMsgDTO;
  }
}
