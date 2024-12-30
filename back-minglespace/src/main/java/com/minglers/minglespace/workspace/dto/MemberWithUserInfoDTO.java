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
public class MemberWithUserInfoDTO {
  private Long wsMemberId;
  private Long userId;
  private String email;
  private String name;
  private String imageUriPath;
  private String position;
  private String phone;
  private String introduction;
  private String role;
  private WithdrawalType withdrawalType;
}
