//Linking up to postgresql
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/safehouse';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE events(img_id SERIAL PRIMARY KEY, event_da TEXT NOT NULL, event_en TEXT NOT NULL, url TEXT, updated TIMESTAMP)');
var query = client.query('CREATE TABLE images(id SERIAL PRIMARY KEY, created TIMESTAMP, meta TEXT[]), year INT, month INT, day INT, file VARCHAR(30) UNIQUE NOT NULL');
var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, username VARCHAR(10) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL, acct_type VARCHAR(10) NOT NULL, lang VARCHAR(2)), storages TEXT[]');
//var query = client.query('CREATE TABLE roles(name VARCHAR(10) PRIMARY KEY)');
//var query = client.query('CREATE TABLE storages(name VARCHAR(30) PRIMARY KEY, location VARCHAR(20) UNIQUE, owner VARCHAR(10), size INT)');

query.on('end', function() { client.end(); });