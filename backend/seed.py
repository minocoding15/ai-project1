from sqlmodel import Session, select
from .db import engine, create_db_and_tables
from .models import Product


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        exists = session.exec(select(Product)).first()
        if exists:
            return

        products = [
            Product(name='Espresso', price=2.5, sold=120, description='Strong and bold.', image_url='https://images.unsplash.com/photo-1511920170033-f8396924c348'),
            Product(name='Cappuccino', price=3.5, sold=90, description='Creamy and frothy.', image_url='https://images.unsplash.com/photo-1509042239860-f550ce710b93'),
            Product(name='Latte', price=3.0, sold=150, description='Smooth milk espresso.', image_url='https://images.unsplash.com/photo-1512568400610-62da28bc8a13'),
            Product(name='Cold Brew', price=3.75, sold=60, description='Chilled and strong.', image_url='https://images.unsplash.com/photo-1510627498534-cf7e9002facc'),
        ]
        session.add_all(products)
        session.commit()


if __name__ == '__main__':
    seed()
