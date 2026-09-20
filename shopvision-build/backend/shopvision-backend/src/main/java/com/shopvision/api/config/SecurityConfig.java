package com.shopvision.api.config;
import org.springframework.context.annotation.*;import org.springframework.security.config.annotation.web.builders.HttpSecurity;import org.springframework.security.web.SecurityFilterChain;import org.springframework.web.cors.*;import java.util.*;
@Configuration public class SecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http)throws Exception{http.csrf(csrf->csrf.disable()).cors(cors->cors.configurationSource(corsSource())).authorizeHttpRequests(a->a.anyRequest().permitAll());return http.build();}
 @Bean CorsConfigurationSource corsSource(){CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(List.of("http://localhost:5173","http://127.0.0.1:5173"));c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("*"));c.setAllowCredentials(true);UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;}
}
