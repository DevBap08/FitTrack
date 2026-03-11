import models
from database import engine

print("Dropping and recreating all tables...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)
print("Done!")
