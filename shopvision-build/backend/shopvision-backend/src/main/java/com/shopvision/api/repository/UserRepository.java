package com.shopvision.api.repository;
import com.shopvision.api.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UserRepository extends JpaRepository<User,Long>{ Optional<User> findByEmail(String email); long countByRole(Role role); long countByRoleAndActiveTrue(Role role); }
