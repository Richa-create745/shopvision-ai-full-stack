package com.shopvision.api.controller;
import com.shopvision.api.entity.Product;import com.shopvision.api.service.InventoryService;import org.springframework.http.MediaType;import org.springframework.web.bind.annotation.*;import org.springframework.web.multipart.MultipartFile;import java.util.*;
@RestController @RequestMapping("/api/inventory") public class InventoryController{
 private final InventoryService service;public InventoryController(InventoryService s){service=s;}
 @PostMapping(value="/shops/{shopId}/analyze",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public List<Product> analyze(@PathVariable Long shopId,@RequestPart("file") MultipartFile file)throws Exception{return service.process(shopId,file);}
 @GetMapping("/shops/{shopId}") public List<Product> list(@PathVariable Long shopId){return service.list(shopId);}
}
