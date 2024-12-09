package com.minglers.minglespace.todo.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Builder
public class TodoRequestDTO {
  private Long id;
  private String title;
  private String content;
  private Long start_date;
  private Long end_date;
  private boolean complete;
}
