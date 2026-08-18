# DATABASE MANAGEMENT

## Step 1 — Inspect the ShopTrack database

Run:
```bash
sudo -u postgres psql shoptrack

```
then run:

```sql
\dt
```

Result
```text
              List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | alembic_version | table | postgres
 public | expenses        | table | postgres
 public | products        | table | postgres
 public | revenues        | table | postgres
 public | stock_movements | table | postgres
 public | users           | table | postgres
(6 rows)
```


Alembic is a tool that helps manage changes to relational databases



## Structure of the Table

### **`products`** Table

Run:

```sql
\d products
```

Result:
```text

                                          Table "public.products"
      Column       |           Type           | Collation | Nullable |               Default
-------------------+--------------------------+-----------+----------+--------------------------------------
 id                | integer                  |           | not null | nextval('products_id_seq'::regclass)
 owner_id          | integer                  |           | not null |
 name              | character varying(200)   |           | not null |
 category          | character varying(100)   |           |          |
 unit_price        | double precision         |           | not null |
 quantity_in_stock | integer                  |           |          |
 reorder_level     | integer                  |           |          |
 description       | text                     |           |          |
 created_at        | timestamp with time zone |           |          | now()
 updated_at        | timestamp with time zone |           |          |
 sku               | character varying(100)   |           |          |
Indexes:
    "products_pkey" PRIMARY KEY, btree (id)
    "ix_products_id" btree (id)
    "ix_products_sku" UNIQUE, btree (sku)
Foreign-key constraints:
    "products_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
Referenced by:
    TABLE "revenues" CONSTRAINT "revenues_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id)
    TABLE "stock_movements" CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id)

```



Stores the products managed by each ShopTrack user.

* **Primary key:** `id`
* **Foreign key:** `owner_id` → `users.id`
* **Key fields:** product name, SKU, category, price, stock quantity, and reorder level
* **Constraint:** SKU must be unique
* **Relationships:** Products can have related stock movements and revenue records


### Check Products in the table

Run:

```sql
SELECT * FROM products;
```

That confirms the current real data in `products`.


### Current Product Data

The local ShopTrack database currently contains one product:

```text
| ID | Owner | Product  | Category | Price | Stock | Reorder Level |
| -: | ----: | -------- | -------- | ----: | ----: | ------------: |
|  1 |     1 | Cocacola | Drinks   |   100 |    13 |             1 |
```
The stock is **13**, reflecting the stock movement we just tested by selling 3 units.

This is useful because we're documenting the database **as it actually exists**, rather than just describing the intended design.


### Inspect **`users`** in the Table

Run:

```sql
\d users
```

Result:
```text
                                         Table "public.users"
     Column      |           Type           | Collation | Nullable |              Default
-----------------+--------------------------+-----------+----------+-----------------------------------
 id              | integer                  |           | not null | nextval('users_id_seq'::regclass)
 name            | character varying(100)   |           | not null |
 email           | character varying(255)   |           | not null |
 hashed_password | character varying(255)   |           | not null |
 business_name   | character varying(200)   |           |          |
 created_at      | timestamp with time zone |           |          | now()
Indexes:
    "users_pkey" PRIMARY KEY, btree (id)
    "ix_users_email" UNIQUE, btree (email)
    "ix_users_id" btree (id)
Referenced by:
    TABLE "expenses" CONSTRAINT "expenses_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
    TABLE "products" CONSTRAINT "products_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
    TABLE "revenues" CONSTRAINT "revenues_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
```


Stores ShopTrack user account information.

* **Primary key:** `id`
* **Unique field:** `email`
* **Key fields:** name, email, hashed password, business name, and creation date
* **Relationships:** Users can own products, expenses, and revenue records
* **Security:** Passwords are stored as hashes rather than plain-text passwords

For the README, that's enough. We don't need to document every PostgreSQL index yet.

### Inspect **`stock_movements`** in the Table

Run:

```sql
\d stock_movements
```

Result:
```text
                                        Table "public.stock_movements"
    Column     |           Type           | Collation | Nullable |                   Default
---------------+--------------------------+-----------+----------+---------------------------------------------
 id            | integer                  |           | not null | nextval('stock_movements_id_seq'::regclass)
 product_id    | integer                  |           | not null |
 movement_type | movementtype             |           | not null |
 quantity      | integer                  |           | not null |
 notes         | text                     |           |          |
 created_at    | timestamp with time zone |           |          | now()
Indexes:
    "stock_movements_pkey" PRIMARY KEY, btree (id)
    "ix_stock_movements_id" btree (id)
Foreign-key constraints:
    "stock_movements_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id)
```

Records changes to product stock.

* **Primary key:** `id`
* **Foreign key:** `product_id` → `products.id`
* **Movement types:** `in`, `out`, `return`
* **Key fields:** movement type, quantity, notes, and creation date
* **Relationship:** Each stock movement belongs to a product

### Inspect **`expenses`** in the Table
Run:
```sql
\d expenses
```

Result:
```text
                                        Table "public.expenses"
    Column     |           Type           | Collation | Nullable |               Default
---------------+--------------------------+-----------+----------+--------------------------------------
 id            | integer                  |           | not null | nextval('expenses_id_seq'::regclass)
 owner_id      | integer                  |           | not null |
 category      | expensecategory          |           | not null |
 amount        | double precision         |           | not null |
 description   | text                     |           |          |
 created_at    | timestamp with time zone |           |          | now()
 supplier_name | character varying(200)   |           |          |
Indexes:
    "expenses_pkey" PRIMARY KEY, btree (id)
    "ix_expenses_id" btree (id)
Foreign-key constraints:
    "expenses_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
```


Stores expenses recorded by ShopTrack users.

* **Primary key:** `id`
* **Foreign key:** `owner_id` → `users.id`
* **Enum:** `category` uses the PostgreSQL `expensecategory` type
* **Key fields:** category, amount, description, supplier name, and creation date
* **Relationship:** Each expense belongs to a user



### Inspect **`revenues`** in the Table
Run:
```sql
\d revenues
```

Result:
```text
                                        Table "public.revenues"
    Column     |           Type           | Collation | Nullable |               Default
---------------+--------------------------+-----------+----------+--------------------------------------
 id            | integer                  |           | not null | nextval('revenues_id_seq'::regclass)
 owner_id      | integer                  |           | not null |
 product_id    | integer                  |           |          |
 quantity_sold | integer                  |           |          |
 unit_price    | double precision         |           | not null |
 total_amount  | double precision         |           | not null |
 description   | text                     |           |          |
 created_at    | timestamp with time zone |           |          | now()
Indexes:
    "revenues_pkey" PRIMARY KEY, btree (id)
    "ix_revenues_id" btree (id)
Foreign-key constraints:
    "revenues_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id)
    "revenues_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id)
```


Stores revenue records generated from product sales.

* **Primary key:** `id`
* **Foreign key:** `owner_id` → `users.id`
* **Foreign key:** `product_id` → `products.id`
* **Key fields:** quantity sold, unit price, total amount, description, and creation date
* **Relationships:** Each revenue record belongs to a user and can be associated with a product.

That completes the five main application tables:

```text
users
products
stock_movements
expenses
revenues
```
