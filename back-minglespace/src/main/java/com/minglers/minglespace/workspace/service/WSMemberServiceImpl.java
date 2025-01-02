package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.UserException;
import com.minglers.minglespace.auth.repository.UserFriendRepository;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import com.minglers.minglespace.chat.service.ChatRoomMemberService;
import com.minglers.minglespace.common.service.NotificationService;
import com.minglers.minglespace.common.type.NotificationType;
import com.minglers.minglespace.common.util.MsConfig;
import com.minglers.minglespace.todo.repository.TodoRepository;
import com.minglers.minglespace.workspace.dto.FriendWithWorkspaceStatusDTO;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import com.minglers.minglespace.workspace.entity.WorkspaceInvite;
import com.minglers.minglespace.workspace.exception.WorkspaceException;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceInviteRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class WSMemberServiceImpl implements WSMemberService {

  private final WorkspaceRepository workspaceRepository;
  private final WSMemberRepository wsMemberRepository;
  private final WorkspaceInviteRepository workspaceInviteRepository;
  private final UserRepository userRepository;
  private final UserFriendRepository userFriendRepository;
  private final ModelMapper modelMapper;
  private final EmailInviteService emailInviteService;
  private final NotificationService notificationService;
  private final TodoRepository todoRepository;
  private final ChatRoomMemberService chatRoomMemberService;

  ///////////공통 메서드
  //유저정보 가져오기
  private User findUserById(Long userId) {
    return userRepository.findById(userId)
            .orElseThrow(() -> new UserException(HttpStatus.NOT_FOUND.value(), "유저정보를 찾을수 없습니다."));
  }

  //워크스페이스 가져오기
  private WorkSpace findWorkSpaceById(Long workSpaceId) {
    return workspaceRepository.findById(workSpaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 정보를 찾을수 없습니다."));
  }

  //워크스페이스멤버 가져오기
  private WSMember findWSMemberBy(Long userId, Long workSpaceId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, workSpaceId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버가 아닙니다"));
  }

  //wsMemberId로 워크스페이스 멤버 조회(pk로)
  private WSMember findById(Long wsMemberId) {
    return wsMemberRepository.findById(wsMemberId)
            .orElseThrow(() -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "워크스페이스 멤버가 아닙니다"));
  }

  /////////////////////////////////
  //리더 체크하기
  @Override
  @Transactional(readOnly = true)
  public void checkLeader(Long userId, Long workSpaceId) {

    WSMember wsMember = findWSMemberBy(userId, workSpaceId);

    if (WSMemberRole.LEADER != wsMember.getRole())
      throw new WorkspaceException(HttpStatus.FORBIDDEN.value(), "워크스페이스 리더가 아닙니다");
  }

  //리더+서브리더 체크하기
  @Override
  @Transactional(readOnly = true)
  public void checkLeaderAndSubLeader(Long userId, Long workSpaceId) {
    WSMember wsMember = findWSMemberBy(userId, workSpaceId);

    if (WSMemberRole.LEADER != wsMember.getRole() && WSMemberRole.SUB_LEADER != wsMember.getRole())
      throw new WorkspaceException(HttpStatus.FORBIDDEN.value(), "워크스페이스 리더,서브리더가 아닙니다");
  }

  //ws멤버조회(유저와, workspaceId)
  @Override
  public WSMember findByUserIdAndWsId(Long userId, Long wsId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, wsId)
            .orElse(null);
  }

  //워크스페이스에 참여중인 멤버 리스트 조회 유저 정보와 함꼐
  @Override
  @Transactional(readOnly = true)
  public List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId) {
    List<WSMember> wsMembers = wsMemberRepository.findByWorkSpaceIdOrderByCustomRoleAndUserName(workspaceId);

    List<MemberWithUserInfoDTO> wsMemberList = new ArrayList<>();

    for (WSMember member : wsMembers) {
      User user = member.getUser();

      String imageUriPath = (user.getImage() != null && user.getImage().getUripath() != null) ? user.getImage().getUripath() : "";

      MemberWithUserInfoDTO dto = MemberWithUserInfoDTO.builder()
              .wsMemberId(member.getId())
              .userId(user.getId())
              .email(user.getEmail())
              .name(user.getName())
              .imageUriPath(imageUriPath)
              .position(user.getPosition())
              .phone(user.getPhone())
              .introduction(user.getIntroduction())
              .role(member.getRole().name())
              .withdrawalType(user.getWithdrawalType())
              .build();

      wsMemberList.add(dto);
    }

    return wsMemberList;
  }

  @Override
  public List<WSMember> findByWorkSpaceId(Long workspaceId) {
    return wsMemberRepository.findByWorkSpaceIdOrderByCustomRoleAndUserName(workspaceId);
  }

  //친구목록을 불러오는데 내 워크스페이스에 참여중인지 아닌지 구분
  @Override
  @Transactional(readOnly = true)
  public List<FriendWithWorkspaceStatusDTO> getFriendWithWorkspace(Long userId, Long workSpaceId) {
    List<User> userList = userFriendRepository
            .findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED, null);

    return userList.stream().map((user) -> {
      return FriendWithWorkspaceStatusDTO.builder()
              .friendId(user.getId())
              .email(user.getEmail())
              .name(user.getName())
              .imageUriPath(Objects.isNull(user.getImage()) ? null : user.getImage().getUripath())
              .position(user.getPosition())
              .withdrawalType(user.getWithdrawalType())
              .inWorkSpace(wsMemberRepository
              .existsByWorkSpaceIdAndUserId(workSpaceId, user.getId()))
              .build();
    }).toList();
  }

  //유저를 방에 초대하기
  @Override
  @Transactional
  public String inviteMember(Long friendId, Long workSpaceId) {
    User user = findUserById(friendId);
    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    if (!wsMemberRepository.existsByWorkSpaceIdAndUserId(workSpaceId,friendId)) {
      WSMember wsMember = WSMember.builder()
              .role(WSMemberRole.MEMBER)
              .workSpace(workSpace)
              .user(user)
              .build();
      WSMember savedMember = wsMemberRepository.save(wsMember);
      notificationService.sendNotification(user.getId(), workSpace.getName() + "에 초대되었습니다..", "/workspace/" + workSpace.getId(), NotificationType.MEMBER);
      return savedMember.getUser().getName() + "님 초대에 성공했습니다";
    } else {
      return "이미 워크스페이스에 참여중입니다";
    }
  }

  //멤버 내보내기(리더만가능)
  @Override
  @Transactional
  public String removeMember(Long memberId, Long workSpaceId) {
    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    WSMember wsMember = findById(memberId);
    wsMemberRepository.delete(wsMember);
    notificationService.sendNotification(wsMember.getUser().getId(), workSpace.getName() + "에서 추방되었습니다..", "/main", NotificationType.KICK);
    return wsMember.getUser().getName() + "님을 추방하였습니다.";
  }

  //워크스페이스 나가기
  @Override
  @Transactional
  public String exitWorkspaceMember(Long userId, Long workSpaceId){
    WorkSpace workSpace = findWorkSpaceById(workSpaceId);
    User user = findUserById(userId);
    WSMember wsMember = wsMemberRepository.findWsMemberByUserIdAndWorkSpaceId(userId, workSpaceId);
    chatRoomMemberService.forceDelegateLeaderByWorkspaceId(wsMember.getId(), workSpaceId);
    wsMemberRepository.delete(wsMember);
    return workSpace.getName() + "에서 퇴장하셨습니다.";
  }

  //유저id+권한 가져오기
  @Override
  @Transactional(readOnly = true)
  public WSMemberResponseDTO getWorkSpaceRole(Long userId, Long workSpaceId) {

    WSMember wsMember = findWSMemberBy(userId, workSpaceId);

    return WSMemberResponseDTO.builder()
            .memberId(wsMember.getId())
            .role(wsMember.getRole().name())
            .build();
  }

  //리더 위임하기
  @Override
  @Transactional
  public String transferLeader(Long userId, Long memberId, Long workspaceId) {
    WorkSpace workSpace = findWorkSpaceById((workspaceId));
    WSMember wsLeader = findWSMemberBy(userId, workspaceId); //원래 리더확인
    WSMember wsMember = findById(memberId); //멤버 id(ws쪽 pk임)

    wsLeader.changeRole(WSMemberRole.MEMBER);
    WSMember savedMember = wsMemberRepository.save(wsLeader);//리더를 멤버로

    wsMember.changeRole(WSMemberRole.LEADER);
    WSMember savedLeader = wsMemberRepository.save(wsMember);//멤버or서브리더 를 리더로

      notificationService.sendNotification(wsMember.getUser().getId(), workSpace.getName() + "워크스페이스의 리더로 위임되었습니다.", "/workspace/" + workSpace.getId() + "/member", NotificationType.MEMBER);
      return savedLeader.getUser().getName() + "님을 리더로 위임하였습니다.";
    }

    //권한 바꾸기
    @Override
    @Transactional
    public String transferRole (Long workspaceId, Long memberId, String role){
      WSMember wsMember = findById(memberId);
      if ("MEMBER".equals(role))
        wsMember.changeRole(WSMemberRole.MEMBER);
      else if ("SUB_LEADER".equals(role))
        wsMember.changeRole(WSMemberRole.SUB_LEADER);
      WSMember savedMember = wsMemberRepository.save(wsMember);

      return savedMember.getUser().getName() + "님의 권한을 " + savedMember.getRole().name() +
              "으로 변경하였습니다";
    }

    @Override
    public void checkWSMember (Long userId, Long workSpaceId){
      if (!wsMemberRepository.existsByWorkSpaceIdAndUserId(workSpaceId, userId))
        throw new WorkspaceException(HttpStatus.FORBIDDEN.value(), "잘못된 요청입니다.");
    }

    //링크방식 초대하기
    @Override
    @Transactional
    public String sendInviteEmail (Long workspaceId, String email){
      WorkSpace workSpace = findWorkSpaceById(workspaceId);
      Optional<User> targetUser = userRepository.findByEmail(email);

      if (targetUser.isPresent()) {//이미 가입한 유저이면서,워크스페이스에 존재하면
        if (wsMemberRepository.existsByWorkSpaceIdAndUserId(workspaceId, targetUser.get().getId())) {
          return targetUser.get().getEmail() + "님은 이미 워크스페이스 멤버입니다.";
        }
      }

      //1. 이메일을 보낸다.(링크+uuid)
      String uuid = UUID.randomUUID().toString();

      String url = MsConfig.getClientUrl()+"/workspace/" + workspaceId + "/invite/"
              + uuid; //하나로 빌드후 수정해야함

      CompletableFuture<String> emailResult = emailInviteService.sendEmail(workSpace.getName(), url, email);
      String returnString = emailResult.thenApply((result) -> {
        if ("success".equals(result)) {
          return "success";
        } else {
          return "fail";
        }
      }).join();
      //2. 실패시 실패응답을 한다.
      if ("fail".equals(returnString))
        return "이메일 전송에 실패하였습니다";

      //3. 전송완료시 db에 저장한다.(일단 기존이메일이 db에 있는지 확인후 기존꺼가 있으면 지운다.)
      Optional<WorkspaceInvite> workspaceInvite = workspaceInviteRepository.findByEmail(email);
      workspaceInvite.ifPresent(workspaceInviteRepository::delete);

      WorkspaceInvite workspaceInviteEntity = WorkspaceInvite.builder()
              .email(email)
              .urlLink(url)
              .expirationTime(LocalDateTime.now().plusHours(24))
              .workSpace(workSpace)
              .uuid(uuid)
              .build();

      WorkspaceInvite savedWorkspaceInvite = workspaceInviteRepository.save(workspaceInviteEntity);

      return savedWorkspaceInvite.getEmail() + "님에게 이메일 링크를 전송하였습니다.";
    }

    @Override
    @Transactional
    public String checkInvite (Long workspaceId, String uuid){
      WorkspaceInvite workspaceInvite = workspaceInviteRepository.findByUuid(uuid).orElseThrow(
              () -> new WorkspaceException(HttpStatus.NOT_FOUND.value(), "초대링크가 존재하지 않습니다."));

      if (LocalDateTime.now().isAfter(workspaceInvite.getExpirationTime()))
        return "만료된 링크입니다.";

      WorkSpace workSpace = findWorkSpaceById(workspaceId);
      Optional<User> targetUser = userRepository.findByEmail(workspaceInvite.getEmail());

      //이미 가입한 유저
      if (targetUser.isPresent()) {
        wsMemberRepository.save(WSMember.builder()
                .role(WSMemberRole.MEMBER)
                .user(targetUser.get())
                .workSpace(workSpace)
                .build());
        return "existUser";
      } else {//존재하지 않는 유저
        return "notExistUser";
      }
    }

  @Override
  @Transactional(readOnly = true)
  public String withdrawalCheckLeader(Long userId) {
    List<WSMember> wsMemberList = wsMemberRepository.findAllByUserId(userId);

    StringBuilder stringBuilder = new StringBuilder();

    wsMemberList.forEach(wsMember -> {
      if("LEADER".equals(wsMember.getRole().name())){
        stringBuilder.append(wsMember.getWorkSpace().getName()).append(", ");
      }
    });
    if(stringBuilder.isEmpty()){
      return "SUCCESS";
    }
    return stringBuilder.substring(0, stringBuilder.lastIndexOf(", "))+"의 워크스페이스 리더 권한이 남아있습니다." +
            " 워크스페이스를 삭제하거나 리더권한을 위임해주세요";
  }
}
