package com.minglers.minglespace.workspace.dto;

import lombok.*;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WorkSpaceResponseDTO {
  private Long id;
  private String name;
  private String wsdesc;
  private int count;
}
