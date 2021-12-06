CREATE TABLE tokens
(
  id int PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  access_token LONGTEXT NOT NULL,
  access_token_expires_at DATETIME NOT NULL,
  refresh_token LONGTEXT NOT NULL,
  refresh_token_expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL default CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
