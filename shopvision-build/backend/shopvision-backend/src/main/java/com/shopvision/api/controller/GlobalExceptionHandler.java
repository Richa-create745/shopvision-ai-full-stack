package com.shopvision.api.controller;
import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.time.Instant;import java.util.*;
@RestControllerAdvice public class GlobalExceptionHandler{
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("timestamp",Instant.now(),"message",e.getMessage()));}
 @ExceptionHandler(Exception.class) ResponseEntity<?> err(Exception e){return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("timestamp",Instant.now(),"message",e.getMessage()==null?"Server error":e.getMessage()));}
}
