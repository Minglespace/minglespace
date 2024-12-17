package com.minglers.minglespace.calendar.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.minglers.minglespace.common.converter.LocalDateTimeConverter;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CalendarRequestDTO {
  private Long id;
  private String title;
  private String description;
  @JsonDeserialize(using = LocalDateTimeConverter.class)
  private LocalDateTime start;
}
