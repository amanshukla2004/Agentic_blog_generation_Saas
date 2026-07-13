package com.saas.gateway.blog;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/blogs")
public class AdminBlogController {

    private final BlogRepository blogRepository;

    public AdminBlogController(BlogRepository blogRepository) {
        this.blogRepository = blogRepository;
    }

    @PutMapping("/{id}/staff-pick")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<BlogResponseDTO> toggleStaffPick(@PathVariable UUID id, @RequestBody java.util.Map<String, Boolean> body) {
        Boolean isStaffPick = body.get("isStaffPick");
        if (isStaffPick == null) {
            return ResponseEntity.badRequest().build();
        }

        return blogRepository.findById(id).map(blog -> {
            blog.setIsStaffPick(isStaffPick);
            blogRepository.save(blog);
            return ResponseEntity.ok(BlogResponseDTO.fromEntity(blog));
        }).orElse(ResponseEntity.notFound().build());
    }
    
}
