package com.shopvision.api.config;

import com.shopvision.api.entity.Role;
import com.shopvision.api.entity.User;
import com.shopvision.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email:}") private String email;
    @Value("${app.admin.password:}") private String password;
    @Value("${app.admin.name:ShopVision Admin}") private String name;

    public AdminBootstrap(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) return;
        if (users.findByEmail(email).isPresent()) return;
        users.save(User.builder()
                .name(name)
                .email(email)
                .passwordHash(encoder.encode(password))
                .role(Role.ADMIN)
                .active(true)
                .build());
    }
}
