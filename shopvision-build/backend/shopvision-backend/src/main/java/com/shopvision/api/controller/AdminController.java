package com.shopvision.api.controller;
import com.shopvision.api.dto.AdminDtos.Dashboard;import com.shopvision.api.service.AdminService;import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin") public class AdminController{private final AdminService service;public AdminController(AdminService s){service=s;}@GetMapping("/dashboard") public Dashboard dashboard(){return service.dashboard();}}
