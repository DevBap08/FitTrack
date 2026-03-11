import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:postgres@localhost/life_tracker"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Deleting set logs where exercise_id is NULL...")
    result = conn.execute(text("DELETE FROM set_logs WHERE exercise_id IS NULL"))
    conn.commit()
    print(f"Deleted {result.rowcount} orphaned logs.")

    print("\nVerifying data...")
    plans = conn.execute(text("SELECT count(*) FROM workout_plans")).scalar()
    print(f"Total Plans: {plans}")
    
    rows = conn.execute(text("SELECT id, name FROM workout_plans")).fetchall()
    for row in rows:
        print(f"Plan: {row[1]} (id: {row[0]})")
