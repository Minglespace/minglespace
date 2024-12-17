package com.minglers.minglespace.todo.dto;

import com.minglers.minglespace.workspace.dto.WSMemberResponseDTO;
import com.minglers.minglespace.workspace.entity.WSMember;
import lombok.*;

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
  private Long start_date;
  private Long end_date;
  private boolean complete;
  private String creator_name;
  private List<WSMemberResponseDTO> assignee_list;
}
