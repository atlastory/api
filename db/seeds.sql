-- SEED DATA

INSERT INTO changesets (user_id, message, status, finished_at) VALUES
    (1, 'Initial commit', 'done', NOW());
INSERT INTO directives (changeset_id, action, object, object_id, data) VALUES
    (1, 'add', 'period', 1, '{"name":"1999-2000","start_year":1999,"end_year":2000}'),
    (1, 'add', 'level', 1, '{"name":"land","level":1}'),
    (1, 'add', 'type', 1, '{"name":"land","level_id":1}'),
    (1, 'add', 'source', 1, '{"name":"Atlastory Contributors","source":"http://forum.atlastory.com/"}');
INSERT INTO periods (name, start_year, end_year) VALUES
    ('1999-2000', 1999, 2000);
INSERT INTO levels (name, level) VALUES ('land', 1);
INSERT INTO types (level_id, name) VALUES (1, 'land');

INSERT INTO sources (name, source) VALUES
    ('Atlastory Contributors', 'http://forum.atlastory.com/');
