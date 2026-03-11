from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    tasks = relationship("Task", back_populates="owner")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    workout_plans = relationship("WorkoutPlan", back_populates="owner")
    food_logs = relationship("FoodLog", back_populates="owner")
    workout_sessions = relationship("WorkoutSession", back_populates="owner")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    activity_level = Column(String, nullable=True) # Sedentary, Lightly Active, etc.
    goal = Column(String, nullable=True) # Bulk, Recomp, Cut
    tdee = Column(Float, nullable=True)
    calorie_target = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="workout_plans")
    exercises = relationship("Exercise", back_populates="plan", cascade="all, delete-orphan")
    sessions = relationship("WorkoutSession", back_populates="plan")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"))
    name = Column(String, nullable=False)
    target_sets = Column(Integer, nullable=False)
    target_reps = Column(Integer, nullable=False)
    target_weight = Column(Float, nullable=True)
    muscle_group = Column(String, nullable=True) # Chest, Back, etc.
    order_index = Column(Integer, default=0)
    video_url = Column(String, nullable=True)

    plan = relationship("WorkoutPlan", back_populates="exercises")
    logs = relationship("SetLog", back_populates="exercise")

class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("workout_plans.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    body_weight = Column(Float, nullable=True)
    sleep_quality = Column(Integer, nullable=True) # 1-5
    energy_level = Column(Integer, nullable=True) # 1-5
    has_pain = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True) # 1-5 post-workout rating
    notes = Column(Text, nullable=True)

    owner = relationship("User", back_populates="workout_sessions")
    plan = relationship("WorkoutPlan", back_populates="sessions")
    logs = relationship("SetLog", back_populates="session", cascade="all, delete-orphan")

class SetLog(Base):
    __tablename__ = "set_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    reps = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    rpe = Column(Float, nullable=True) # Rate of Perceived Exertion (1-10)
    is_pr = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("WorkoutSession", back_populates="logs")
    exercise = relationship("Exercise", back_populates="logs")

class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    food_name = Column(String, nullable=False)
    grams = Column(Float, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="food_logs")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="Medium")
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tasks")
