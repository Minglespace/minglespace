package com.minglers.minglespace.todo.dto;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Setter
@Builder
public class TodoResponseDTO {
  private Long id;
  private String title;
  private String content;
  private Long start_date;
  private Long end_date;
  private boolean complete;

  private List<TodoAssigneeResponseDTO> todoAssigneeResponseDTOList;
}
