package com.shopvision.api.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.UUID;
@Service
public class FileStorageService {
 private final Path root;
 public FileStorageService(@Value("${app.upload-dir:uploads}") String dir){root=Paths.get(dir).toAbsolutePath().normalize();try{Files.createDirectories(root);}catch(IOException e){throw new RuntimeException(e);}}
 public Path store(MultipartFile file) throws IOException {String safe=UUID.randomUUID()+"_"+(file.getOriginalFilename()==null?"media":file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]","_"));Path p=root.resolve(safe);Files.copy(file.getInputStream(),p,StandardCopyOption.REPLACE_EXISTING);return p;}
}
