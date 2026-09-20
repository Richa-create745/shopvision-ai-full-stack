package com.shopvision.api.controller;
import com.shopvision.api.entity.*;import com.shopvision.api.repository.ComplaintRepository;import com.shopvision.api.service.ComplaintService;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/complaints") public class ComplaintController{
 private final ComplaintService service;private final ComplaintRepository repo;public ComplaintController(ComplaintService s,ComplaintRepository r){service=s;repo=r;}
 @PostMapping public Complaint create(@RequestParam Long userId,@RequestParam(required=false) Long shopId,@RequestParam String issue){return service.create(userId,shopId,issue);}
 @GetMapping public List<Complaint> all(){return repo.findAll();}
 @PutMapping("/{id}/status") public Complaint status(@PathVariable Long id,@RequestParam ComplaintStatus status){return service.updateStatus(id,status);}
 @GetMapping("/customer") public List<Complaint> customer(){return repo.findByComplainantRole(Role.CUSTOMER);}
 @GetMapping("/shopkeeper") public List<Complaint> shopkeeper(){return repo.findByComplainantRole(Role.SHOPKEEPER);}
}
