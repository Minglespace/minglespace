package com.minglers.minglespace.calendar.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.minglers.minglespace.common.converter.LocalDateTimeConverter;
import com.minglers.minglespace.workspace.entity.WorkSpace;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarResponseDTO {
  private Long id;
  private String title;
  private String description;

  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime start;
}
