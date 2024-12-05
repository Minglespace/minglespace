package com.minglers.minglespace.workspace.dto;

import lombok.*;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class WorkspaceRequestDTO {
    private String name;
    private String wsdesc;
}
