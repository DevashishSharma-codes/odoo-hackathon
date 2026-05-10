-- =============================================================
--  Traveloop – Database Schema
--  Run: mysql -u root -p < traveloop_schema.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS traveloop
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE traveloop;

-- =============================================================
-- 1. USERS
-- =============================================================
CREATE TABLE users (
  id                  INT UNSIGNED         NOT NULL AUTO_INCREMENT,
  name                VARCHAR(100)         NOT NULL,
  email               VARCHAR(255)         NOT NULL UNIQUE,
  password_hash       VARCHAR(255)         NOT NULL,
  profile_photo_url   VARCHAR(500)         DEFAULT NULL,
  language_preference VARCHAR(10)          NOT NULL DEFAULT 'en',
  role                ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at          TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- =============================================================
-- 2. CITIES
-- =============================================================
CREATE TABLE cities (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name              VARCHAR(100)  NOT NULL,
  country           VARCHAR(100)  NOT NULL,
  region            VARCHAR(100)  DEFAULT NULL,
  cost_index        DECIMAL(5,2)  NOT NULL DEFAULT 1.00 COMMENT 'relative cost multiplier',
  popularity_score  SMALLINT      NOT NULL DEFAULT 0,
  cover_photo_url   VARCHAR(500)  DEFAULT NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_cities_name    (name),
  INDEX idx_cities_country (country)
) ENGINE=InnoDB;

-- =============================================================
-- 3. ACTIVITIES
-- =============================================================
CREATE TABLE activities (
  id               INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  city_id          INT UNSIGNED  NOT NULL,
  name             VARCHAR(150)  NOT NULL,
  description      TEXT          DEFAULT NULL,
  category         VARCHAR(60)   NOT NULL COMMENT 'e.g. sightseeing, food, adventure, culture',
  estimated_cost   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes SMALLINT      NOT NULL DEFAULT 60,
  image_url        VARCHAR(500)  DEFAULT NULL,
  created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_activities_city     (city_id),
  INDEX idx_activities_category (category),
  CONSTRAINT fk_activities_city
    FOREIGN KEY (city_id) REFERENCES cities (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 4. TRIPS
-- =============================================================
CREATE TABLE trips (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED  NOT NULL,
  name            VARCHAR(150)  NOT NULL,
  description     TEXT          DEFAULT NULL,
  cover_photo_url VARCHAR(500)  DEFAULT NULL,
  start_date      DATE          NOT NULL,
  end_date        DATE          NOT NULL,
  status          ENUM('draft','planned','ongoing','completed') NOT NULL DEFAULT 'draft',
  is_public       TINYINT(1)    NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_trips_user   (user_id),
  INDEX idx_trips_status (status),
  CONSTRAINT fk_trips_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 5. STOPS
-- =============================================================
CREATE TABLE stops (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  trip_id        INT UNSIGNED  NOT NULL,
  city_id        INT UNSIGNED  NOT NULL,
  arrival_date   DATE          NOT NULL,
  departure_date DATE          NOT NULL,
  order_index    SMALLINT      NOT NULL DEFAULT 0 COMMENT 'display order within the trip',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_stops_trip (trip_id),
  INDEX idx_stops_city (city_id),
  CONSTRAINT fk_stops_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_stops_city
    FOREIGN KEY (city_id) REFERENCES cities (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 6. STOP_ACTIVITIES
-- =============================================================
CREATE TABLE stop_activities (
  id             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  stop_id        INT UNSIGNED  NOT NULL,
  activity_id    INT UNSIGNED  NOT NULL,
  scheduled_time TIME          DEFAULT NULL COMMENT 'e.g. 09:00:00',
  actual_cost    DECIMAL(10,2) DEFAULT NULL COMMENT 'overrides activity.estimated_cost if set',
  is_completed   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_stop_activity (stop_id, activity_id),
  INDEX idx_sa_stop     (stop_id),
  INDEX idx_sa_activity (activity_id),
  CONSTRAINT fk_sa_stop
    FOREIGN KEY (stop_id) REFERENCES stops (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sa_activity
    FOREIGN KEY (activity_id) REFERENCES activities (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 7. BUDGETS  (1:1 with trips – auto-created via trigger)
-- =============================================================
CREATE TABLE budgets (
  id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  trip_id            INT UNSIGNED  NOT NULL UNIQUE,
  total_budget       DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'user-set ceiling',
  transport_cost     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  accommodation_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  activities_cost    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  meals_cost         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  misc_cost          DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  updated_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_budgets_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 8. PACKING_ITEMS
-- =============================================================
CREATE TABLE packing_items (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  trip_id    INT UNSIGNED  NOT NULL,
  item_name  VARCHAR(150)  NOT NULL,
  category   VARCHAR(60)   NOT NULL DEFAULT 'general' COMMENT 'clothing | documents | electronics | general',
  is_packed  TINYINT(1)    NOT NULL DEFAULT 0,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_packing_trip (trip_id),
  CONSTRAINT fk_packing_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 9. NOTES
-- =============================================================
CREATE TABLE notes (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  trip_id    INT UNSIGNED  NOT NULL,
  stop_id    INT UNSIGNED  DEFAULT NULL COMMENT 'NULL = trip-level note',
  content    TEXT          NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_notes_trip (trip_id),
  INDEX idx_notes_stop (stop_id),
  CONSTRAINT fk_notes_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notes_stop
    FOREIGN KEY (stop_id) REFERENCES stops (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 10. SHARED_TRIPS
-- =============================================================
CREATE TABLE shared_trips (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  trip_id      INT UNSIGNED  NOT NULL UNIQUE,
  public_token VARCHAR(64)   NOT NULL UNIQUE COMMENT 'random token used in the public URL',
  is_active    TINYINT(1)    NOT NULL DEFAULT 1,
  view_count   INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_shared_token (public_token),
  CONSTRAINT fk_shared_trip
    FOREIGN KEY (trip_id) REFERENCES trips (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 11. SAVED_DESTINATIONS
-- =============================================================
CREATE TABLE saved_destinations (
  id       INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id  INT UNSIGNED  NOT NULL,
  city_id  INT UNSIGNED  NOT NULL,
  saved_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_saved (user_id, city_id),
  INDEX idx_saved_user (user_id),
  INDEX idx_saved_city (city_id),
  CONSTRAINT fk_saved_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_saved_city
    FOREIGN KEY (city_id) REFERENCES cities (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- 12. ADMIN_LOGS
-- =============================================================
CREATE TABLE admin_logs (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED  DEFAULT NULL COMMENT 'NULL if system action',
  action_type   VARCHAR(60)   NOT NULL COMMENT 'e.g. CREATE_TRIP, DELETE_USER',
  target_entity VARCHAR(60)   NOT NULL COMMENT 'table name: trips, users, ...',
  target_id     INT UNSIGNED  DEFAULT NULL,
  meta          JSON          DEFAULT NULL COMMENT 'optional extra context',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_logs_user   (user_id),
  INDEX idx_logs_action (action_type),
  CONSTRAINT fk_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =============================================================
-- TRIGGER – auto-create budget row when a trip is inserted
-- =============================================================
DELIMITER $$
CREATE TRIGGER trg_create_budget_on_trip
AFTER INSERT ON trips
FOR EACH ROW
BEGIN
  INSERT INTO budgets (trip_id) VALUES (NEW.id);
END$$
DELIMITER ;

-- =============================================================
-- VIEWS
-- =============================================================

-- Trip summary: stop count + estimated total spend
CREATE OR REPLACE VIEW v_trip_summary AS
SELECT
  t.id                                                          AS trip_id,
  t.user_id,
  t.name                                                        AS trip_name,
  t.start_date,
  t.end_date,
  t.status,
  COUNT(DISTINCT s.id)                                          AS stop_count,
  COALESCE(SUM(COALESCE(sa.actual_cost, a.estimated_cost)), 0)  AS estimated_total_cost
FROM trips t
LEFT JOIN stops           s  ON s.trip_id    = t.id
LEFT JOIN stop_activities sa ON sa.stop_id   = s.id
LEFT JOIN activities      a  ON a.id         = sa.activity_id
GROUP BY t.id, t.user_id, t.name, t.start_date, t.end_date, t.status;

-- Budget breakdown by activity category per trip (feeds the pie/bar charts)
CREATE OR REPLACE VIEW v_budget_by_category AS
SELECT
  s.trip_id,
  a.category,
  SUM(COALESCE(sa.actual_cost, a.estimated_cost)) AS category_total
FROM stop_activities sa
JOIN activities a ON a.id  = sa.activity_id
JOIN stops      s ON s.id  = sa.stop_id
GROUP BY s.trip_id, a.category;