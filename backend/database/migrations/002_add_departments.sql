-- Add departments table
CREATE TABLE IF NOT EXISTS departments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_name (name)
);

-- Add department_id to courses table
ALTER TABLE courses 
ADD COLUMN department_id CHAR(36),
ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD INDEX idx_department (department_id);

-- Add department_id to users table (optional - for user department assignment)
ALTER TABLE users 
ADD COLUMN department_id CHAR(36),
ADD FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
ADD INDEX idx_user_department (department_id);

-- Insert default departments (using fixed UUIDs for consistency)
INSERT IGNORE INTO departments (id, name, slug, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'IT', 'it', 'Information Technology Department'),
('550e8400-e29b-41d4-a716-446655440002', 'LMS', 'lms', 'Learning Management System Department'),
('550e8400-e29b-41d4-a716-446655440003', 'Engineering', 'engineering', 'Engineering Department');

