import os
import psycopg2
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found in environment variables")
    if '?' in db_url:
        db_url = db_url.split('?')[0]
    return psycopg2.connect(db_url)

def extract_data():
    conn = get_db_connection()
    try:
        # Extract Users
        users_df = pd.read_sql('SELECT id, status, "createdAt" FROM "User"', conn)
        
        # Extract Books
        books_df = pd.read_sql('SELECT id, title, genre, "availableCopies", "totalCopies" FROM "Book"', conn)
        
        # Extract Borrows
        borrows_df = pd.read_sql('SELECT id, "issueDate", "dueDate", "returnDate", status, "memberId", "bookId" FROM "Borrow"', conn)
        
        return {
            'users': users_df,
            'books': books_df,
            'borrows': borrows_df
        }
    finally:
        conn.close()
