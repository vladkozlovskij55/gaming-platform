CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE,
    password TEXT
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    description TEXT
);

CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    game VARCHAR(50),
    score INT
);