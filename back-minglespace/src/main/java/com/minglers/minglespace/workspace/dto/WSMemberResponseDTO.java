package com.minglers.minglespace.workspace.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString
public class WSMemberResponseDTO {
  private Long memberId;
  private String name;
  private String role;
}
