import psycopg2
from app.config import settings

def test():
    try:
        # Connect using the SYNC_DATABASE_URL (psycopg2 format)
        conn = psycopg2.connect(settings.SYNC_DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = [row[0] for row in cur.fetchall()]
        print('Tables found:', len(tables))
        print(tables)
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    test()
