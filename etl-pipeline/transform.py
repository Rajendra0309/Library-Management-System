import pandas as pd
from datetime import datetime
import json

def transform_data(data):
    users_df = data.get('users', pd.DataFrame())
    books_df = data.get('books', pd.DataFrame())
    borrows_df = data.get('borrows', pd.DataFrame())

    # Total Members
    total_members = len(users_df) if not users_df.empty else 0

    # Total Books
    total_books = int(books_df['totalCopies'].sum()) if not books_df.empty else 0

    # Active Borrows
    if not borrows_df.empty:
        active_borrows = len(borrows_df[borrows_df['status'] == 'active'])
        overdue_borrows = len(borrows_df[borrows_df['status'] == 'overdue'])
    else:
        active_borrows = 0
        overdue_borrows = 0

    # Fines (Simplification: mock calculation if no Fine table)
    # Assume $2 fine per overdue borrow
    total_fines = overdue_borrows * 2.0

    # Genre Stats
    genre_stats = {}
    if not books_df.empty:
        for genres in books_df['genre']:
            if isinstance(genres, list):
                for g in genres:
                    genre_stats[g] = genre_stats.get(g, 0) + 1
            elif isinstance(genres, str):
                for g in genres.strip('{}').split(','):
                    g = g.strip()
                    if g:
                        genre_stats[g] = genre_stats.get(g, 0) + 1

    # Borrowing Trends (Last 7 days mock or calculate)
    borrowing_trends = []
    if not borrows_df.empty:
        borrows_df['issueDate'] = pd.to_datetime(borrows_df['issueDate'])
        recent_borrows = borrows_df[borrows_df['issueDate'] > (datetime.now() - pd.Timedelta(days=30))]
        trends = recent_borrows.groupby(recent_borrows['issueDate'].dt.date).size().reset_index(name='count')
        for _, row in trends.iterrows():
            borrowing_trends.append({"date": str(row['issueDate']), "borrows": int(row['count'])})
    else:
        # Default mock if empty
        borrowing_trends = [{"date": str(datetime.now().date()), "borrows": 0}]

    return {
        'totalBooks': total_books,
        'totalMembers': total_members,
        'activeBorrows': active_borrows,
        'overdueBorrows': overdue_borrows,
        'totalFines': total_fines,
        'genreStats': json.dumps(genre_stats),
        'borrowingTrends': json.dumps(borrowing_trends)
    }
