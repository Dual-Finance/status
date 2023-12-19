exports.up = async sql => {
    await sql`create schema so`;

    await sql`create table so.mints(
        id SERIAL NOT NULL PRIMARY KEY,
        address VARCHAR(45) NULL,
        state VARCHAR(45) NULL,
        type VARCHAR(10) NULL,
        label VARCHAR(127) NULL,
        base VARCHAR(45) NULL,
        quote VARCHAR(45) NULL,
        strike INT NOT NULL,
        lot_size INT NOT NULL,
        expiration TIMESTAMP WITH TIME ZONE NOT NULL,
        subscription_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    )`;
    await sql`create table so.issues(
        id SERIAL NOT NULL PRIMARY KEY,
        state VARCHAR(45) NULL,
        signature VARCHAR(88) NOT NULL,
        slot BIGINT NOT NULL,
        amount INT PRECISION NOT NULL,
        mint VARCHAR(45) NULL,
        recipient VARCHAR(45) NULL,
    )`;
    await sql`create table so.exercises(
        id SERIAL NOT NULL PRIMARY KEY,
        signature VARCHAR(88) NOT NULL,
        slot BIGINT NOT NULL,
        type VARCHAR(10) NOT NULL,
        state VARCHAR(45) NOT NULL,
        mint VARCHAR(45) NOT NULL,
        reverse_mint VARCHAR(45) NULL,
        amount_lots_received INT PRECISION NOT NULL,
        amount_paid_atoms INT PRECISION NOT NULL,
        option_token_account VARCHAR(45) NOT NULL,
        user_payment_account VARCHAR(45) NOT NULL,
        user_token_account VARCHAR(45) NOT NULL,
        user_token_account_owner VARCHAR(45) NOT NULL,
    )`;
    await sql`create table so.transfers(
        id SERIAL NOT NULL PRIMARY KEY,
        signature VARCHAR(88) NOT NULL,
        slot BIGINT NOT NULL,
        mint VARCHAR(45) NOT NULL,
        sender_token_account VARCHAR(45) NOT NULL,
        sender_owner VARCHAR(45) NOT NULL,
        recipient_owner VARCHAR(45) NOT NULL,
    )`;
  };
  
  exports.down = async sql => {
    await sql`drop table so.transfers`;
    await sql`drop table so.exercises`;
    await sql`drop table so.issues`;
    await sql`drop table so.mints`;
  
    await sql`drop schema so`;
  };