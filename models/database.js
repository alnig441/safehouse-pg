//Linking up to postgresql
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/testDB';

var client = new pg.Client(connectionString);
client.connect();
var query = client.query('CREATE TABLE events(id SERIAL PRIMARY KEY, event_da TEXT not null, event_en TEXT not null, url TEXT not null, created TIMESTAMP)');
var query = client.query('CREATE TABLE images(id SERIAL PRIMARY KEY, url TEXT not null, created TIMESTAMP, meta TEXT[])');
var query = client.query('CREATE TABLE users(id SERIAL PRIMARY KEY, username VARCHAR(10) UNIQUE not null, password VARCHAR(12) not null, acct_type VARCHAR(10) not null, lang VARCHAR(2))');

query.on('end', function() { client.end(); });