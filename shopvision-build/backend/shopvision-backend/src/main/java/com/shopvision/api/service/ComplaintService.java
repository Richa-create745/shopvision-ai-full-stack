package com.shopvision.api.service;
import com.shopvision.api.entity.*;import com.shopvision.api.repository.*;import org.springframework.stereotype.Service;
@Service public class ComplaintService{
 private final ComplaintRepository complaints;private final UserRepository users;private final ShopRepository shops;
 public ComplaintService(ComplaintRepository c,UserRepository u,ShopRepository s){complaints=c;users=u;shops=s;}
 public Complaint create(Long userId,Long shopId,String issue){User u=users.findById(userId).orElseThrow();Shop s=shopId==null?null:shops.findById(shopId).orElse(null);return complaints.save(Complaint.builder().createdBy(u).complainantRole(u.getRole()).shop(s).issue(issue).status(ComplaintStatus.PENDING).build());}
 public Complaint updateStatus(Long id,ComplaintStatus status){Complaint c=complaints.findById(id).orElseThrow();c.setStatus(status);return complaints.save(c);}
}
