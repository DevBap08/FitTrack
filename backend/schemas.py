from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., max_length=71)

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "Medium"
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    completed: bool
    priority: str
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

# --- User Profile Schemas ---
class UserProfileBase(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    goal: Optional[str] = None

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int
    tdee: Optional[float] = None
    calorie_target: Optional[float] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Workout Schemas ---
class ExerciseBase(BaseModel):
    name: str
    target_sets: int
    target_reps: int
    target_weight: Optional[float] = None
    muscle_group: Optional[str] = None
    order_index: Optional[int] = 0
    video_url: Optional[str] = None

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    plan_id: int

    class Config:
        from_attributes = True

class WorkoutPlanBase(BaseModel):
    name: str

class WorkoutPlanCreate(WorkoutPlanBase):
    exercises: List[ExerciseCreate]

class WorkoutPlan(WorkoutPlanBase):
    id: int
    owner_id: int
    created_at: datetime
    exercises: List[Exercise]

    class Config:
        from_attributes = True

class SetLogBase(BaseModel):
    exercise_id: int
    reps: int
    weight: float
    rpe: Optional[float] = None
    is_pr: bool = False
    notes: Optional[str] = None

class SetLogCreate(SetLogBase):
    pass

class SetLog(SetLogBase):
    id: int
    session_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class WorkoutSessionBase(BaseModel):
    plan_id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    body_weight: Optional[float] = None
    sleep_quality: Optional[int] = None
    energy_level: Optional[int] = None
    has_pain: bool = False
    rating: Optional[int] = None
    notes: Optional[str] = None

class WorkoutSessionCreate(WorkoutSessionBase):
    logs: List[SetLogCreate]

class WorkoutSession(WorkoutSessionBase):
    id: int
    owner_id: int
    date: datetime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    body_weight: Optional[float] = None
    sleep_quality: Optional[int] = None
    energy_level: Optional[int] = None
    has_pain: bool = False
    rating: Optional[int] = None
    logs: List[SetLog]

    class Config:
        from_attributes = True

# --- Food Log Schemas ---
class FoodLogBase(BaseModel):
    food_name: str
    grams: float
    calories: float
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fat: Optional[float] = None

class FoodLogCreate(FoodLogBase):
    pass

class FoodLog(FoodLogBase):
    id: int
    owner_id: int
    logged_at: datetime

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
