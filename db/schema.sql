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

DROP TABLE IF EXISTS reviews_photos;
CREATE TABLE reviews_photos (
  id INTEGER PRIMARY KEY,
  review_id INTEGER,
  url VARCHAR
);

DROP TABLE IF EXISTS features;
CREATE TABLE features (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  feature VARCHAR,
  value VARCHAR
);

DROP TABLE IF EXISTS characteristics;
CREATE TABLE characteristics (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  name VARCHAR
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

--handle transformation of date first

\COPY tempreviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/reviews.csv' DELIMITER ',' CSV HEADER;
INSERT INTO reviews (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) SELECT id, product_id, rating, to_timestamp(date/1000)::date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness FROM tempreviews

\COPY reviews_photos (id, review_id, url) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/reviews_photos.csv' DELIMITER ',' CSV HEADER;
\COPY features (id, product_id, feature, value) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/features.csv' DELIMITER ',' CSV HEADER;
\COPY characteristics (id, product_id, name) FROM '/Users/simonsi/Desktop/SDC REVIEW DATA/characteristics.csv' DELIMITER ',' CSV HEADER;