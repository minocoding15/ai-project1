# Coffee Shop Backend

This backend provides a small FastAPI service with SQLite to manage coffee products (CRUD).

Quick start

1. Create a Python virtual environment and activate it.

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Seed the database (optional)

```bash
python -m backend.seed
```

4. Run the app (bind to a network IP)

Replace `10.0.1.80` with your machine IP if different.

```bash
# activate your venv first
source .venv/bin/activate

# bind to the specific IP so other devices can connect
python -m uvicorn backend.main:app --reload --host 10.0.1.80 --port 8000
```

API endpoints

- `GET /products` — list products
- `GET /products/{id}` — get product
- `POST /products` — create product (send JSON)
- `PUT /products/{id}` — update product
- `DELETE /products/{id}` — remove product

CORS is enabled for the Vite dev server (http://localhost:5173).
