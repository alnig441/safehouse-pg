//Linking up to postgresql
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE events(id SERIAL PRIMARY KEY, event_da TEXT NOT NULL, event_en TEXT NOT NULL, url TEXT, created TIMESTAMP, img_id INT UNIQUE NOT NULL), updated TIMESTAMP');
var query = client.query('CREATE TABLE images(id SERIAL PRIMARY KEY, url TEXT UNIQUE NOT NULL, created TIMESTAMP, meta TEXT[])');
var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, username VARCHAR(10) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL, acct_type VARCHAR(10) NOT NULL, lang VARCHAR(2))');

query.on('end', function() { client.end(); });