package com.minglers.minglespace.workspace.dto;

import com.minglers.minglespace.auth.type.WithdrawalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendWithWorkspaceStatusDTO {
  private Long friendId;
  private String email;
  private String name;
  private String imageUriPath;
  private String position;
  private boolean inWorkSpace;
  private WithdrawalType withdrawalType;

}
