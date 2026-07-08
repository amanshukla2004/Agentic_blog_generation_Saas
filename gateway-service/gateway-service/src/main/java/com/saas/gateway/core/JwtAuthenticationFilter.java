package com.saas.gateway.core;

import com.saas.gateway.auth.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(TokenProvider tokenProvider, UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String userIdStr = tokenProvider.getUserIdFromToken(jwt);
                // We'll use the token string to get the user email. Since we need UserDetails, 
                // wait, tokenProvider.getUserIdFromToken returns the UUID subject.
                // Our UserDetailsService loadUserByUsername expects an email! Let's just use it to fetch the authorities,
                // or we can adjust UserDetailsService to load by ID, or we can put email in the claim.
                // We put email in the claim in TokenProvider! We didn't create a getter for it. Let's fix TokenProvider or just load by ID.
                
                // For simplicity, let's just create the auth token directly from the claims to be fully stateless,
                // or we can get the email claim. We can parse the token again to get the email claim.
                // But better to just put the userId as the principal name so controllers can easily get it.
                
                // Let's create an Authentication token with the principal as the User ID string.
                // To get roles, we'd need to extract the "auth" claim. Let's just load the UserDetails via email for security.
                
                String email = tokenProvider.getEmailFromToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                
                // But we want Principal.getName() to return the User ID (UUID string) as requested in the controller.
                // So we can use userIdStr as the principal, and userDetails.getAuthorities() for authorities.
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userIdStr, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
