package com.shopvision.api.dto;
import java.util.*;
public final class AdminDtos { private AdminDtos(){}
 public record Dashboard(long registeredCustomers,long activeCustomers,long registeredShopkeepers,long verifiedShops,long pendingComplaints,List<?> customers,List<?> shops,List<?> customerComplaints,List<?> shopkeeperComplaints){}
}
