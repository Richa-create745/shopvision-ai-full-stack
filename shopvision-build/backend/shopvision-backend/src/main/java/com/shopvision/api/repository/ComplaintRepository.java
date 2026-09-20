package com.shopvision.api.repository;
import com.shopvision.api.entity.*;
import org.springframework.data.jpa.repository.*;
public interface ComplaintRepository extends JpaRepository<Complaint,Long>{ long countByStatus(ComplaintStatus status); java.util.List<Complaint> findByComplainantRole(Role role); }
