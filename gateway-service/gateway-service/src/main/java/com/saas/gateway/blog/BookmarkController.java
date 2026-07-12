package com.saas.gateway.blog;

import com.saas.gateway.user.User;
import com.saas.gateway.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public BookmarkController(BookmarkRepository bookmarkRepository, BlogRepository blogRepository, UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/{blogId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<?> addBookmark(@PathVariable UUID blogId, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        User user = userRepository.findById(userId).orElseThrow();
        BlogDraft blog = blogRepository.findById(blogId).orElseThrow();

        // Prevent IDOR: Ensure the blog is either published or belongs to the current user
        if (blog.getStatus() != Status.PUBLISHED && !blog.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        if (bookmarkRepository.findByUserIdAndBlogId(user.getId(), blog.getId()).isEmpty()) {
            Bookmark bookmark = new Bookmark(user, blog);
            bookmarkRepository.save(bookmark);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{blogId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    @Transactional
    public ResponseEntity<?> removeBookmark(@PathVariable UUID blogId, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        bookmarkRepository.deleteByUserIdAndBlogId(userId, blogId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<PublicBlogController.PublicBlogSummary>> getMyBookmarks(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        UUID userId = UUID.fromString(principal.getName());
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId, pageable);
        
        Page<PublicBlogController.PublicBlogSummary> summaryPage = bookmarks.map(bookmark -> {
            BlogDraft blog = bookmark.getBlog();
            return new PublicBlogController.PublicBlogSummary(
                blog.getId(),
                blog.getTopic(),
                blog.getTitle(),
                blog.getSlug(),
                blog.getSeoDescription(),
                blog.getCategory(),
                blog.getCreatedAt(),
                blog.getUser() != null ? blog.getUser().getEmail() : "Unknown Author",
                blog.getUser() != null ? blog.getUser().getUsername() : null,
                blog.getTags(),
                blog.getLikesCount(),
                blog.getViewCount(),
                blog.getIsStaffPick(),
                BlogResponseDTO.extractCoverImage(blog.getRawMarkdown())
            );
        });
        
        return ResponseEntity.ok(summaryPage);
    }
    
    @GetMapping("/ids")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'MASTER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<UUID>> getMyBookmarkedBlogIds(Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        List<UUID> ids = bookmarkRepository.findByUserId(userId).stream()
            .map(bookmark -> bookmark.getBlog().getId())
            .collect(Collectors.toList());
        return ResponseEntity.ok(ids);
    }
}
