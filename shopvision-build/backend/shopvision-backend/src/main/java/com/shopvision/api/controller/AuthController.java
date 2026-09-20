package com.shopvision.api.controller;
import com.shopvision.api.dto.AuthDtos.*;import com.shopvision.api.service.AuthService;import jakarta.validation.Valid;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController{private final AuthService service;public AuthController(AuthService s){service=s;}@PostMapping("/register") public AuthResponse register(@Valid @RequestBody RegisterRequest r){return service.register(r);}@PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){return service.login(r);}}
