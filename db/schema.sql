DROP TABLE IF EXISTS comments, photos, reviews, operating_hours, bookmarks, 
places, cities, countries, categories, users, admins CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_picture_url VARCHAR(255),
    bio TEXT,
    country VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP,
    last_password_change TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_access_date TIMESTAMP,
    
    can_add_reviews BOOLEAN DEFAULT false,
    can_edit_reviews BOOLEAN DEFAULT false,
    can_delete_reviews BOOLEAN DEFAULT false,
    can_moderate_reviews BOOLEAN DEFAULT false,
    
    reviews_added INTEGER DEFAULT 0,
    reviews_edited INTEGER DEFAULT 0,
    reviews_deleted INTEGER DEFAULT 0,
    reviews_moderated INTEGER DEFAULT 0,
    
    average_review_score DECIMAL(3,2),
    review_approval_rate DECIMAL(5,2),
    review_response_time INTEGER,
    flagged_reviews_handled INTEGER DEFAULT 0,
    
    last_review_action_date TIMESTAMP,
    last_moderation_date TIMESTAMP,
    total_actions_performed INTEGER DEFAULT 0,
    
    review_categories_handled VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    preferred_categories VARCHAR[] DEFAULT ARRAY[]::VARCHAR[],
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    
    review_action_log JSONB DEFAULT '[]',
    review_notes TEXT,
    
    UNIQUE(user_id),
    CONSTRAINT valid_review_score CHECK (average_review_score BETWEEN 1 AND 5),
    CONSTRAINT valid_approval_rate CHECK (review_approval_rate BETWEEN 0 AND 100)
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    continent TEXT NOT NULL CHECK (continent IN ('Asia', 'Africa', 'North America', 'South America', 'Antarctica', 'Europe', 'Oceania')),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NULL,
    state_province VARCHAR(100),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    population INTEGER CHECK (population >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180),
    UNIQUE(country_id, slug)
);

CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    website_url VARCHAR(255),
    phone_number VARCHAR(50),
    price_level SMALLINT CHECK (price_level BETWEEN 1 AND 5),
    average_rating DECIMAL(3,2) CHECK (average_rating BETWEEN 1 AND 5),
    review_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    submission_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (submission_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180),
    UNIQUE(city_id, slug)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    visit_date DATE NOT NULL,
    helpful_votes INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT visit_date_not_future CHECK (visit_date <= CURRENT_DATE),
    CONSTRAINT one_review_per_user_place UNIQUE (user_id, place_id)
);

CREATE TABLE bookmarks (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    collection_name VARCHAR(50) DEFAULT 'Default',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    notes TEXT,
    is_private BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (user_id, place_id)
);

CREATE TABLE operating_hours (
    id SERIAL PRIMARY KEY,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    season_start DATE,
    season_end DATE,
    is_special_hours BOOLEAN NOT NULL DEFAULT false,
    special_hours_description TEXT,
    UNIQUE(place_id, day_of_week, season_start, season_end),
    CHECK (open_time < close_time),
    CHECK ((season_start IS NULL AND season_end IS NULL) OR (season_start IS NOT NULL AND season_end IS NOT NULL))
);

CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    caption TEXT,
    metadata JSONB,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_featured BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    helpful_votes INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_places_city ON places(city_id);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX idx_photos_place ON photos(place_id);
CREATE INDEX idx_photos_user ON photos(user_id);
CREATE INDEX idx_comments_review ON comments(review_id);
CREATE INDEX idx_users_username_email ON users(username, email);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_operating_hours_place ON operating_hours(place_id);
CREATE INDEX idx_admins_user ON admins(user_id);
CREATE INDEX idx_admins_department ON admins(department);

-- Admin view for review management
CREATE VIEW admin_review_management AS
SELECT 
    r.id AS review_id,
    r.title AS review_title,
    r.content AS review_content,
    r.rating,
    r.visit_date,
    r.created_at AS review_created_at,
    r.moderation_status,
    r.helpful_votes,
    r.report_count,
    u.username AS reviewer_username,
    u.email AS reviewer_email,
    p.name AS place_name,
    p.category_id,
    c.name AS category_name,
    city.name AS city_name,
    country.name AS country_name
FROM 
    reviews r
    JOIN users u ON r.user_id = u.id
    JOIN places p ON r.place_id = p.id
    JOIN categories c ON p.category_id = c.id
    JOIN cities city ON p.city_id = city.id
    JOIN countries country ON city.country_id = country.id;