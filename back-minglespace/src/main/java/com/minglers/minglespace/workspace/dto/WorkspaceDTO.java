package com.minglers.minglespace.workspace.dto;

import lombok.*;

public class WorkspaceDTO {

  @Builder
  @Getter
  @AllArgsConstructor
  @NoArgsConstructor
  @ToString
  public static class Request{
    private String name;
    private String wsdesc;
  }

  @Builder
  @Getter
  @Setter
  @AllArgsConstructor
  @NoArgsConstructor
  @ToString
  public static class Response{
    private Long id;
    private String name;
    private String wsdesc;
    private int count;
  }

}
