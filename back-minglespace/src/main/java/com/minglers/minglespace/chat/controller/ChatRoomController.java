package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.dto.*;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.service.ChatMessageService;
import com.minglers.minglespace.chat.service.ChatRoomMemberService;
import com.minglers.minglespace.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/api/workspaces/{workspaceId}/chatRooms")
public class ChatRoomController {
    private final ChatRoomService chatRoomService;
    private final ChatRoomMemberService chatRoomMemberService;
    private final ChatMessageService chatMessageService;


    //채팅방 목록 조회 memberid 후에 jwt로 대체..
    @GetMapping("/members/{wsMemberId}")
    public ResponseEntity<List<ChatListResponseDTO>> getRoomsByMember(@PathVariable Long workspaceId, @PathVariable Long wsMemberId) {
        log.info("getRoomsByMember wsid - " + workspaceId + ", memberid - " + wsMemberId);
        List<ChatListResponseDTO> chatRooms = chatRoomService.getRoomsByWsMember(workspaceId, wsMemberId);
        return ResponseEntity.ok(chatRooms);
    }

    //방 생성
    @PostMapping("")
    public ResponseEntity<ChatListResponseDTO> createRoom(@PathVariable Long workspaceId,
                                                          @RequestPart("requestDTO") CreateChatRoomRequestDTO requestDTO,
                                                          @RequestPart("image")MultipartFile image){
        requestDTO.setWorkspaceId(workspaceId);
        requestDTO.setImage(image);
        ChatListResponseDTO chatRoomdto= chatRoomService.createRoom(requestDTO);
        return ResponseEntity.ok(chatRoomdto);
    }


    //특정 방 조회
    @GetMapping("/{chatRoomId}")
    public ResponseEntity<?> getChatRoomWithMsg(@PathVariable Long workspaceId, @PathVariable Long chatRoomId, @RequestParam Long memberId){
        //memberId -> jwt
        if (!chatRoomMemberService.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, memberId)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("채팅방 참여 멤버가 아닙니다.");
        }

        ChatRoom chatRoom = chatRoomService.findRoomById(chatRoomId);
        if (chatRoom == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("채팅방이 존재하지 않습니다.");
        }

        //메시지 목록
        List<ChatMessageDTO> messages = chatMessageService.getMessagesByChatRoom(chatRoom);
        //참여자 목록
        List<ChatRoomMemberDTO> participants = chatRoomMemberService.getParticipantsByChatRoomId(chatRoomId);

        ChatRoomResponseDTO chatRoomResponseDTO = ChatRoomResponseDTO.builder()
                .chatRoomId(chatRoomId)
                .name(chatRoom.getName())
                .participants(participants)
                .messages(messages)
                .workSpaceId(chatRoom.getWorkSpace().getId())
                .imageUriPath(chatRoom.getImage().getUripath())
                .build();
        return ResponseEntity.ok(chatRoomResponseDTO);
    }

    //채팅방 멤버 추가
    @PostMapping("/{chatRoomId}/members/{addMemberId}")
    public ResponseEntity<String> addMemberToRoom(@PathVariable Long workspaceId, @PathVariable Long chatRoomId, @PathVariable Long addMemberId, @RequestBody Map<String, Object> request){
        //currentMemberId -> jwt인증으로
        Long currentMemberId = Long.valueOf(request.get("currentMemberId").toString());

        if(!chatRoomMemberService.isRoomLeader(chatRoomId, currentMemberId)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 추가할 수 있습니다.");
        }

        chatRoomMemberService.addUserToRoom(chatRoomId, addMemberId);
        return ResponseEntity.ok("참여자 추가 완료");
    }


    //채팅방 멤버 강퇴
    @DeleteMapping("/{chatRoomId}/members/{kickMemberId}/kick")
    public ResponseEntity<String> kickMemberFromRoom(@PathVariable Long workspaceId, @PathVariable Long chatRoomId, @PathVariable Long kickMemberId, @RequestBody Map<String, Object> request){
        //currentMemberId -> jwt
        Long currentMemberId = Long.valueOf(request.get("currentMemberId").toString());

        if (!chatRoomMemberService.isRoomLeader(chatRoomId, currentMemberId)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("방장만 멤버를 강퇴할 수 있습니다.");
        }

        chatRoomMemberService.kickMemberFromRoom(chatRoomId, kickMemberId);
        return ResponseEntity.ok("참여자 강퇴 완료");
    }

    //자진 방 나가기
    @DeleteMapping("/{chatRoomId}/members/{wsMemberId}/leave")
    public ResponseEntity<String> leaveChatRoom(@PathVariable Long workspaceId, @PathVariable Long chatRoomId, @PathVariable Long wsMemberId) {
        log.info("leavechatRoom_ memberid: "+ workspaceId);

        chatRoomMemberService.updateIsLeftFromLeave(chatRoomId, wsMemberId);
        return ResponseEntity.ok("채팅방 나가기 완료");
    }

    //방장 위임
    @PatchMapping("/{chatRoomId}/leader/{newLeaderId}")
    public ResponseEntity<String> delegateLeader(@PathVariable Long workspaceId, @PathVariable Long chatRoomId, @PathVariable Long newLeaderId, @RequestBody Map<String, Object> request){
        Long currentMemberId = Long.valueOf(request.get("currentMemberId").toString());

        try{
            chatRoomMemberService.delegateLeader(chatRoomId, newLeaderId, currentMemberId);
            return ResponseEntity.ok("방장 위임 완료");
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
