import asyncio
from app.database import engine
from sqlalchemy import text

async def test():
    async with engine.connect() as conn:
        res = await conn.execute(
            text("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
        )
        print("Tables count:", res.scalar())

asyncio.run(test())