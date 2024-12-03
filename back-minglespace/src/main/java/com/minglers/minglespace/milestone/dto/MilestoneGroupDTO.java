package com.minglers.minglespace.milestone.dto;

import lombok.*;

public class MilestoneGroupDTO {
  @NoArgsConstructor
  @AllArgsConstructor
  @ToString
  @Getter
  @Builder
  public static class Request{

    private String title;
  }
}
