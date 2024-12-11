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
  List<WSMember> findByWorkSpaceIdOrderByUserNameAsc(Long workspaceId);

  //친구가 워크스페이스에 있는지 확인여부
  @Query("SELECT COUNT(wsm) > 0 FROM WSMember wsm WHERE wsm.user.id = :friendId AND wsm.workSpace.id = :workspaceId")
  boolean isFriendInWorkSpace(@Param("friendId") Long friendId, @Param("workspaceId") Long workspaceId);

  //초대하는데 이미 접속한인원인지 체크하기
  boolean existsByWorkSpaceIdAndUserId(Long workspaceId, Long userId);

}
