package com.minglers.minglespace.sampleData;

import com.minglers.minglespace.workspace.service.WSMemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class checkLeader {

  @Autowired
  WSMemberService wsMemberService;

  @Test
  public void check(){
    System.out.println(wsMemberService.withdrawalCheckLeader(3L));
  }
}
