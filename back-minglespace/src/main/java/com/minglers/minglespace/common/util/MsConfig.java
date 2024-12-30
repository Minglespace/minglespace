package com.minglers.minglespace.common.util;

import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Log4j2
@Component
public class MsConfig {

  @Getter
  private static String clientUrl;

  @Getter
  private static int withdrawalExpireHours;


  public static final long WITHDRAWAL_POLLING_CYCLE_MILLS = 60 * 60 * 1000;        // 1 시간


  @Value("${msconfig.client.url}")
  private void setClientUrl(String clientUrl){
    log.info("[MIRO] MsConfig.clientUrl {}", clientUrl);
    MsConfig.clientUrl = clientUrl;
  }

  @Value("${msconfig.withdrawl.expire.hours}")
  private void setWithdrawalExpireHours(int hours){
    log.info("[MIRO] MsConfig.withdrawalExpireHours {}", hours);
    MsConfig.withdrawalExpireHours = hours;
  }

  public static String getClientUrl(String uri) {return clientUrl + uri;}

}
