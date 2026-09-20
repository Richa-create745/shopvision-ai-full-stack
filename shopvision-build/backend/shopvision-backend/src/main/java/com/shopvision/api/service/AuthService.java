package com.shopvision.api.service;

import com.shopvision.api.dto.AuthDtos.*;
import com.shopvision.api.entity.*;
import com.shopvision.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class AuthService {
 private final UserRepository users; private final PasswordEncoder encoder;
 public AuthService(UserRepository users,PasswordEncoder encoder){this.users=users;this.encoder=encoder;}
 public AuthResponse register(RegisterRequest r){
   if(users.findByEmail(r.email()).isPresent()) throw new IllegalArgumentException("Email already registered");
   if(r.role()==Role.ADMIN) throw new IllegalArgumentException("Admin registration is disabled");
   User u=User.builder().name(r.name()).email(r.email()).passwordHash(encoder.encode(r.password())).phone(r.phone()).role(r.role()).active(true).lastActiveAt(Instant.now()).build();
   u=users.save(u); return new AuthResponse(u.getId(),u.getName(),u.getEmail(),u.getRole());
 }
 public AuthResponse login(LoginRequest r){
   User u=users.findByEmail(r.email()).orElseThrow(()->new IllegalArgumentException("Invalid email or password"));
   if(!encoder.matches(r.password(),u.getPasswordHash())) throw new IllegalArgumentException("Invalid email or password");
   u.setActive(true);u.setLastActiveAt(Instant.now());users.save(u);
   return new AuthResponse(u.getId(),u.getName(),u.getEmail(),u.getRole());
 }
}
