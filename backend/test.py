import asyncio
from app.database import engine
from sqlalchemy import text
import traceback

async def test():
    try:
        async with engine.connect() as conn:
            await conn.execute(text('SELECT 1'))
            await conn.execute(text('SELECT 1'))
            print('SUCCESS')
    except Exception as e:
        traceback.print_exc()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
