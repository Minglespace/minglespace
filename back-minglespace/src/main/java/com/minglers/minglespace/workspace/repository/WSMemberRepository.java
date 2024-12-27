package com.minglers.minglespace.workspace.repository;

import com.minglers.minglespace.workspace.entity.WSMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface WSMemberRepository extends JpaRepository<WSMember,Long> {
  Optional<WSMember> findByUserIdAndWorkSpaceId(Long userId, Long workspaceId);
  WSMember findWsMemberByUserIdAndWorkSpaceId(Long userId, Long workspaceId);

  @Query("SELECT m FROM WSMember m " +
          "JOIN FETCH m.user " +
          "WHERE m.workSpace.id = :workspaceId " +
          "ORDER BY " +
          "CASE m.role " +
          "  WHEN 'LEADER' THEN 1 " +
          "  WHEN 'SUB_LEADER' THEN 2 " +
          "  WHEN 'MEMBER' THEN 3 " +
          "  ELSE 4 " +
          "END, " +
          "m.user.name ASC")
  List<WSMember> findByWorkSpaceIdOrderByCustomRoleAndUserName(Long workspaceId);

  //유저가 워크스페이스에 있는지 체크하기
  boolean existsByWorkSpaceIdAndUserId(Long workspaceId, Long userId);

  List<WSMember> findAllByUserId(Long userId);
}
