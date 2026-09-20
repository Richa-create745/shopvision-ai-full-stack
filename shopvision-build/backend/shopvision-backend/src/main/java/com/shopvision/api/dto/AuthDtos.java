package com.shopvision.api.dto;

import com.shopvision.api.entity.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
 private AuthDtos(){}
 public record RegisterRequest(@NotBlank String name,@Email @NotBlank String email,@Size(min=6) String password,String phone,@NotNull Role role){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record AuthResponse(Long id,String name,String email,Role role){ }
}
