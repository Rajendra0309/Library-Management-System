import os
import psycopg2
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise ValueError("DATABASE_URL not found in environment variables")
    # Remove Prisma specific query params like ?schema=public
    if '?' in db_url:
        db_url = db_url.split('?')[0]
    return psycopg2.connect(db_url)

def get_recommendations(member_id):
    conn = get_db_connection()
    try:
        # Get all books
        books_query = """
            SELECT id, title, author, genre, description, "coverImage"
            FROM "Book"
        """
        books_df = pd.read_sql(books_query, conn)
        
        if books_df.empty:
            return []

        # Get member's borrow history
        borrows_query = f"""
            SELECT "bookId" 
            FROM "Borrow" 
            WHERE "memberId" = '{member_id}'
        """
        borrows_df = pd.read_sql(borrows_query, conn)
        borrowed_book_ids = borrows_df['bookId'].tolist() if not borrows_df.empty else []

        # If no history, return most popular books overall
        if not borrowed_book_ids:
            popular_query = """
                SELECT b.id, b.title, b.author, b.genre, b.description, b."coverImage", COUNT(br.id) as borrow_count
                FROM "Book" b
                LEFT JOIN "Borrow" br ON b.id = br."bookId"
                GROUP BY b.id
                ORDER BY borrow_count DESC
                LIMIT 5
            """
            popular_df = pd.read_sql(popular_query, conn)
            # Format the output matching what React expects
            return format_books(popular_df)

        # Content-based filtering
        # Create a text representation for each book
        def make_text(row):
            genres = " ".join(row['genre']) if isinstance(row['genre'], list) else str(row['genre']).replace('{', '').replace('}', '').replace(',', ' ')
            return f"{row['author']} {genres}"
        
        books_df['features'] = books_df.apply(make_text, axis=1)

        # Separate into borrowed and unborrowed
        borrowed_books = books_df[books_df['id'].isin(borrowed_book_ids)]
        unborrowed_books = books_df[~books_df['id'].isin(borrowed_book_ids)]

        if unborrowed_books.empty:
            return []

        # Create user profile by combining features of borrowed books
        user_profile = " ".join(borrowed_books['features'].tolist())

        # Combine user profile with unborrowed books to compute TF-IDF
        unborrowed_books = unborrowed_books.copy()
        unborrowed_books.reset_index(drop=True, inplace=True)
        docs = [user_profile] + unborrowed_books['features'].tolist()

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(docs)

        # Compute cosine similarity between user_profile (index 0) and all unborrowed books
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        unborrowed_books['similarity'] = cosine_sim
        recommended = unborrowed_books.sort_values(by='similarity', ascending=False).head(5)

        return format_books(recommended)

    finally:
        conn.close()

def format_books(df):
    books = []
    for _, row in df.iterrows():
        genre_list = row['genre']
        # Handle PostgreSQL array format if it comes as string
        if isinstance(genre_list, str):
            genre_list = genre_list.strip('{}').split(',')
        
        books.append({
            'id': row['id'],
            'title': row['title'],
            'author': row['author'],
            'genre': genre_list,
            'description': row['description'],
            'coverImage': row['coverImage']
        })
    return books
