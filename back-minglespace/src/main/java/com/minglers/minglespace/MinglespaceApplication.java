package com.minglers.minglespace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MinglespaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MinglespaceApplication.class, args);
	}

}
