
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    height_cm INTEGER,
    weight_kg REAL
);

CREATE TABLE workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    pushups INTEGER,
    squats INTEGER,
    jumping_jacks INTEGER,
    walk_minutes INTEGER,
    completed INTEGER
);

CREATE TABLE meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    lunch TEXT,
    dinner TEXT,
    water_liters REAL,
    green_tea_cups INTEGER
);

CREATE TABLE body_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    weight_kg REAL,
    waist_cm REAL,
    notes TEXT
);
