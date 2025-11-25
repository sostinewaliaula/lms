-- MySQL/MariaDB Schema for LMS

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'instructor', 'student') NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) UNIQUE NOT NULL,
    bio TEXT,
    phone VARCHAR(20),
    location VARCHAR(100),
    website VARCHAR(255),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Course categories table
CREATE TABLE IF NOT EXISTS course_categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course tags table
CREATE TABLE IF NOT EXISTS course_tags (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    instructor_id CHAR(36) NOT NULL,
    category_id CHAR(36),
    thumbnail_url VARCHAR(500),
    price DECIMAL(10, 2) DEFAULT 0,
    is_free TINYINT(1) DEFAULT 1,
    is_published TINYINT(1) DEFAULT 0,
    visibility ENUM('public', 'private') DEFAULT 'public',
    difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
    language VARCHAR(10) DEFAULT 'en',
    duration_hours INT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    enrolled_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE SET NULL,
    INDEX idx_instructor (instructor_id),
    INDEX idx_category (category_id),
    INDEX idx_published (is_published)
);

-- Course tags junction table
CREATE TABLE IF NOT EXISTS course_tags_junction (
    course_id CHAR(36),
    tag_id CHAR(36),
    PRIMARY KEY (course_id, tag_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES course_tags(id) ON DELETE CASCADE
);

-- Course prerequisites table
CREATE TABLE IF NOT EXISTS course_prerequisites (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id CHAR(36) NOT NULL,
    prerequisite_course_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_prerequisite (course_id, prerequisite_course_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Content items table
CREATE TABLE IF NOT EXISTS content_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    module_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type ENUM('video', 'document', 'quiz', 'assignment', 'text') NOT NULL,
    content_url VARCHAR(500),
    content_text TEXT,
    duration_minutes INT,
    order_index INT NOT NULL,
    is_preview TINYINT(1) DEFAULT 0,
    is_required TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- Interactive content table
CREATE TABLE IF NOT EXISTS interactive_content (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    content_item_id CHAR(36) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_course (course_id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    content_item_id CHAR(36) NOT NULL,
    is_completed TINYINT(1) DEFAULT 0,
    completed_at TIMESTAMP NULL,
    time_spent_minutes INT DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_progress (user_id, content_item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_content (content_item_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    content_item_id CHAR(36) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_minutes INT,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    quiz_id CHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay') NOT NULL,
    options JSON,
    correct_answer JSON NOT NULL,
    points INT DEFAULT 1,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    quiz_id CHAR(36) NOT NULL,
    score DECIMAL(5, 2),
    total_points DECIMAL(5, 2),
    answers JSON,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    is_passed TINYINT(1),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Forums table (threads)
CREATE TABLE IF NOT EXISTS forums (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id CHAR(36),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned TINYINT(1) DEFAULT 0,
    is_locked TINYINT(1) DEFAULT 0,
    reply_count INT DEFAULT 0,
    last_reply_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course (course_id)
);

-- Forum posts table (replies)
CREATE TABLE IF NOT EXISTS forum_posts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    forum_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sender_id CHAR(36) NOT NULL,
    receiver_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    badge_type VARCHAR(50) NOT NULL,
    criteria JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    badge_id CHAR(36) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    points INT DEFAULT 0,
    criteria JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    achievement_id CHAR(36) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Points/XP tracking table
CREATE TABLE IF NOT EXISTS points (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    points INT NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id CHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
    user_id CHAR(36) PRIMARY KEY,
    total_points INT DEFAULT 0,
    courses_completed INT DEFAULT 0,
    badges_earned INT DEFAULT 0,
    `rank` INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    difficulty_level VARCHAR(20),
    estimated_duration_hours INT,
    is_published TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Path courses junction table
CREATE TABLE IF NOT EXISTS path_courses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    path_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    order_index INT NOT NULL,
    is_required TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_path_course (path_id, course_id),
    FOREIGN KEY (path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_skill_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

-- Course skills junction table
CREATE TABLE IF NOT EXISTS course_skills (
    course_id CHAR(36),
    skill_id CHAR(36),
    PRIMARY KEY (course_id, skill_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- User skills table
CREATE TABLE IF NOT EXISTS user_skills (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    proficiency_level INT DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_verified_purchase TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_wishlist (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read)
);

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id CHAR(36),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_members INT DEFAULT 20,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_member (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    follower_id CHAR(36) NOT NULL,
    following_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_follow (follower_id, following_id),
    CHECK (follower_id != following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_type (event_type),
    INDEX idx_created (created_at)
);
