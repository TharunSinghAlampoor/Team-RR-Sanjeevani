package com.ecommerce.auth.repository;

import com.ecommerce.auth.entity.Session;
import com.ecommerce.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Integer> {

    Optional<Session> findByJwtTokenAndActiveTrue(String jwtToken);

    List<Session> findByUserAndActiveTrue(User user);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Session s SET s.active = false WHERE s.user = :user AND s.active = true")
    int invalidateAllActiveSessions(@Param("user") User user);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Session s SET s.active = false WHERE s.jwtToken = :token AND s.active = true")
    int invalidateByToken(@Param("token") String token);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Session s WHERE s.jwtToken = :token")
    int deleteByJwtToken(@Param("token") String token);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Session s WHERE s.user.userId = :userId")
    int deleteByUserId(@Param("userId") Integer userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Session s WHERE s.user = :user")
    int deleteByUser(@Param("user") User user);
}
