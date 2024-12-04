package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WSMemberServiceImpl implements WSMemberService{
  private final WSMemberRepository wsMemberRepository;

  @Override
  public WSMember findByUserIdAndWsId(Long userId, Long wsId) {
    return wsMemberRepository.findByUserIdAndWorkSpaceId(userId, wsId)
            .orElseThrow(() -> new RuntimeException("워크스페이스에서 멤버를 찾을 수 없습니다."));
  }

  @Override
  public List<WSMember> findByWorkSpaceId(Long workspaceId){
    return wsMemberRepository.findByWorkSpaceId(workspaceId);
  }
}
