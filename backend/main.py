from typing import List
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from dotenv import load_dotenv
import os

load_dotenv()

from .db import create_db_and_tables, get_session
from .models import Product

app = FastAPI(title="Coffee Shop API")

# Allow requests from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/health")
def health():
    return {"status": "ok", "env": os.getenv("DEBUG", "0")}


@app.get("/products", response_model=List[Product])
def read_products(*, session=Depends(get_session)):
    products = session.exec(select(Product)).all()
    return products


@app.get("/products/{product_id}", response_model=Product)
def read_product(product_id: int, *, session=Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products", response_model=Product, status_code=201)
def create_product(product: Product, *, session=Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, product: Product, *, session=Depends(get_session)):
    existing = session.get(Product, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    existing.name = product.name
    existing.description = product.description
    existing.price = product.price
    existing.sold = product.sold
    existing.image_url = product.image_url
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, *, session=Depends(get_session)):
    existing = session.get(Product, product_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(existing)
    session.commit()
    return
