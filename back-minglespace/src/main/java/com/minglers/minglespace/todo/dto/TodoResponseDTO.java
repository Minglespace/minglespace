package com.minglers.minglespace.todo.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.minglers.minglespace.common.converter.LocalDateTimeConverter;
import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"todoAssigneeResponseDTOList"})
@Getter
@Setter
@Builder
public class TodoResponseDTO {
  private Long id;
  private String title;
  private String content;
  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime start_date;
  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime end_date;
  private boolean complete;
  private String creator_name;
  private List<WSMemberResponseDTO> assignee_list;
}
