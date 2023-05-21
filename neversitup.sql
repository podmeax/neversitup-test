CREATE TABLE "users" (
  "users_id" serial PRIMARY KEY NOT NULL,
  "title" varchar NOT NULL,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "username" varchar NOT NULL,
  "password" varchar NOT NULL,
  "nickname" varchar,
  "dob" date,
  "mobileno" varchar,
  "active" varchar NOT NULL,
  "gender" varchar,
  "last_login" timestamp NOT NULL,
  "update_date" timestamp NOT NULL,
  "update_by" integer NOT NULL,
  "create_date" timestamp NOT NULL,
  "create_by" integer NOT NULL
);

CREATE TABLE "refresh_token" (
  "refresh_token_id" serial PRIMARY KEY NOT NULL,
  "token" varchar NOT NULL,
  "expire_date" timestamp NOT NULL,
  "users_id" integer NOT NULL,
  "update_date" timestamp NOT NULL,
  "create_date" timestamp NOT NULL
);

CREATE TABLE "access_token" (
  "access_token_id" serial PRIMARY KEY NOT NULL,
  "token" varchar NOT NULL,
  "expire_date" timestamp NOT NULL,
  "users_id" integer NOT NULL,
  "update_date" timestamp NOT NULL,
  "create_date" timestamp NOT NULL
);

CREATE TABLE "orders" (
  "order_id" serial PRIMARY KEY NOT NULL,
  "order_code" varchar NOT NULL,
  "product_id" integer NOT NULL,
  "product_name" varchar NOT NULL,
  "qty" integer NOT NULL,
  "total_price" float NOT NULL,
  "status" varchar,
  "update_date" timestamp NOT NULL,
  "update_by" integer NOT NULL,
  "create_date" timestamp NOT NULL,
  "create_by" integer NOT NULL
);

CREATE TABLE "product" (
  "product_id" serial PRIMARY KEY NOT NULL,
  "name" varchar NOT NULL,
  "price" float NOT NULL,
  "detail" varchar,
  "update_date" timestamp NOT NULL,
  "update_by" integer NOT NULL,
  "create_date" timestamp NOT NULL,
  "create_by" integer NOT NULL
);

ALTER TABLE "users" ADD FOREIGN KEY ("users_id") REFERENCES "refresh_token" ("users_id");

ALTER TABLE "access_token" ADD FOREIGN KEY ("users_id") REFERENCES "users" ("users_id");

ALTER TABLE "orders" ADD FOREIGN KEY ("update_by") REFERENCES "users" ("users_id");

ALTER TABLE "orders" ADD FOREIGN KEY ("create_by") REFERENCES "users" ("users_id");

ALTER TABLE "product" ADD FOREIGN KEY ("update_by") REFERENCES "users" ("users_id");

ALTER TABLE "product" ADD FOREIGN KEY ("create_by") REFERENCES "users" ("users_id");

ALTER TABLE "product" ADD FOREIGN KEY ("product_id") REFERENCES "orders" ("product_id");
