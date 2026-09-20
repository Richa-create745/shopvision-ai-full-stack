package com.shopvision.api.service;
import com.shopvision.api.dto.AdminDtos.*;import com.shopvision.api.entity.*;import com.shopvision.api.repository.*;import org.springframework.stereotype.Service;
@Service public class AdminService{
 private final UserRepository users;private final ShopRepository shops;private final ComplaintRepository complaints;
 public AdminService(UserRepository u,ShopRepository s,ComplaintRepository c){users=u;shops=s;complaints=c;}
 public Dashboard dashboard(){return new Dashboard(users.countByRole(Role.CUSTOMER),users.countByRoleAndActiveTrue(Role.CUSTOMER),users.countByRole(Role.SHOPKEEPER),shops.findByStatus(ShopStatus.VERIFIED).size(),complaints.countByStatus(ComplaintStatus.PENDING),users.findAll().stream().filter(u->u.getRole()==Role.CUSTOMER).toList(),shops.findAll(),complaints.findByComplainantRole(Role.CUSTOMER),complaints.findByComplainantRole(Role.SHOPKEEPER));}
}
