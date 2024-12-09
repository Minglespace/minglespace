package com.minglers.minglespace.todo.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Builder
public class TodoAssigneeResponseDTO {
  private Long id;
  private Long todoId;
  private Long wsmember_id;
}
