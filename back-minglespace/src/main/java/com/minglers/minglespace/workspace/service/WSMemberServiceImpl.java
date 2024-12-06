package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.workspace.dto.MemberWithUserInfoDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WSMemberServiceImpl implements WSMemberService{
  private final WSMemberRepository wsMemberRepository;

  @Override
  public WSMember findByUserIdAndWsId(Long userId, Long wsId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, wsId)
            .orElse(null);
  }

  @Override
  public List<MemberWithUserInfoDTO> getWsMemberWithUserInfo(Long workspaceId) {
    List<WSMember> wsMembers = wsMemberRepository.findByWorkSpaceId(workspaceId);

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
              .build();

      wsMemberList.add(dto);
    }

    return wsMemberList;
  }

  @Override
  public List<WSMember> findByWorkSpaceId(Long workspaceId){
    return wsMemberRepository.findByWorkSpaceId(workspaceId);
  }
}
