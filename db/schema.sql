DROP DATABASE if exists reviews;
CREATE DATABASE reviews;

\c reviews;

DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  rating INTEGER,
  date date,
  summary VARCHAR,
  body VARCHAR,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR,
  reviewer_email VARCHAR,
  response VARCHAR,
  helpfulness INTEGER
);

CREATE temporary TABLE tempreviews (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  rating INTEGER,
  date BIGINT,
  summary VARCHAR,
  body VARCHAR,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name VARCHAR,
  reviewer_email VARCHAR,
  response VARCHAR,
  helpfulness INTEGER
);

\COPY tempreviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/reviews.csv' DELIMITER ',' CSV HEADER;
INSERT INTO reviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) SELECT id, product_id, rating, to_timestamp(date/1000)::date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness FROM tempreviews;

DROP TABLE IF EXISTS reviews_photos;
CREATE TABLE reviews_photos (
  id INTEGER PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id),
  url VARCHAR
);

DROP TABLE IF EXISTS characteristics;
CREATE TABLE characteristics (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  name VARCHAR
);

DROP TABLE IF EXISTS characteristic_reviews;
CREATE TABLE characteristic_reviews (
  id INTEGER PRIMARY KEY,
  characteristic_id INTEGER REFERENCES characteristics(id),
  review_id INTEGER REFERENCES reviews(id),
  value INTEGER
);

\COPY characteristics (id, product_id, name) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/characteristics.csv' DELIMITER ',' CSV HEADER;
\COPY reviews_photos (id, review_id, url) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/reviews_photos.csv' DELIMITER ',' CSV HEADER;
\COPY characteristic_reviews (id, characteristic_id, review_id, value) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/characteristic_reviews.csv' DELIMITER ',' CSV HEADER;

