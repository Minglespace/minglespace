package com.minglers.minglespace.todo.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.minglers.minglespace.common.converter.LocalDateTimeConverter;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Getter
@Builder
public class TodoRequestDTO {
  private Long id;
  private String title;
  private String content;

  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime start_date;
  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime end_date;

  private boolean complete;
  private String creator_name;
  private List<Long> assignee_id;
  private List<Long> wsMember_id;
}
