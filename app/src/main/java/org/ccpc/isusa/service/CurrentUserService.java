package org.ccpc.isusa.service;

import lombok.RequiredArgsConstructor;
import org.ccpc.isusa.entity.main.User;
import org.ccpc.isusa.repository.main.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser(UserDetails principal) {
        return userRepository.findByUsername(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }
}
