CREATE TABLE players (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 name_key TEXT NOT NULL UNIQUE,
 password TEXT,
 salt TEXT,
 role TEXT NOT NULL DEFAULT 'player',
 reset_hash TEXT,
 reset_until INTEGER,
 failures INTEGER NOT NULL DEFAULT 0,
 retry_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE sessions (
 token_hash TEXT PRIMARY KEY,
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 expires INTEGER NOT NULL
);
CREATE INDEX sessions_player ON sessions(player_id);
CREATE TABLE scores (
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 game TEXT NOT NULL,
 score INTEGER NOT NULL,
 PRIMARY KEY(player_id,game)
);
CREATE INDEX scores_rank ON scores(game,score DESC);
CREATE TABLE arcade_wallet (
 player_id TEXT PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
 gold INTEGER NOT NULL DEFAULT 0 CHECK(gold>=0),
 equipped TEXT NOT NULL DEFAULT 'gobelin'
);
CREATE TABLE arcade_runs (
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 run_id TEXT NOT NULL,
 gold INTEGER NOT NULL,
 PRIMARY KEY(player_id,run_id)
);
CREATE TABLE arcade_skins (
 player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
 skin TEXT NOT NULL,
 PRIMARY KEY(player_id,skin)
);
CREATE TRIGGER arcade_credit AFTER INSERT ON arcade_runs BEGIN
 INSERT INTO arcade_wallet(player_id,gold) VALUES (NEW.player_id,NEW.gold)
 ON CONFLICT(player_id) DO UPDATE SET gold=gold+NEW.gold;
END;
CREATE TRIGGER arcade_purchase AFTER INSERT ON arcade_skins BEGIN
 UPDATE arcade_wallet SET gold=gold-2500 WHERE player_id=NEW.player_id;
END;
