from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Car Rental SaaS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/car_rental_saas")
client = MongoClient(MONGO_URL)
db = client.car_rental_saas

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# User roles
class UserRole:
    SUPER_ADMIN = "super_admin"
    AGENCY_ADMIN = "agency_admin"
    STAFF = "staff"
    CLIENT = "client"

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = UserRole.CLIENT
    agency_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AgencyCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    description: Optional[str] = None

class CarCreate(BaseModel):
    title: str
    model: str
    brand: str
    year: int
    plate_number: str
    color: str
    price_per_day: float
    features: List[str] = []
    agency_id: str

class BookingCreate(BaseModel):
    car_id: str
    client_email: EmailStr
    client_name: str
    client_phone: str
    pickup_date: datetime
    return_date: datetime
    pickup_location: str
    return_location: str
    message: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.users.find_one({"user_id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(required_roles: List[str]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

# Initialize super admin
@app.on_event("startup")
async def startup_event():
    # Create super admin if doesn't exist
    super_admin = db.users.find_one({"role": UserRole.SUPER_ADMIN})
    if not super_admin:
        super_admin_data = {
            "user_id": str(uuid.uuid4()),
            "email": "admin@carrentalsaas.com",
            "password": hash_password("admin123"),
            "first_name": "Super",
            "last_name": "Admin",
            "role": UserRole.SUPER_ADMIN,
            "agency_id": None,
            "created_at": datetime.utcnow()
        }
        db.users.insert_one(super_admin_data)
        print("Super admin created: admin@carrentalsaas.com / admin123")

# Authentication routes
@app.post("/api/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = {
        "user_id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "role": user_data.role,
        "agency_id": user_data.agency_id,
        "created_at": datetime.utcnow()
    }
    
    db.users.insert_one(user)
    
    # Create token
    token = create_access_token({"sub": user["user_id"]})
    
    return {
        "message": "User registered successfully",
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
            "agency_id": user["agency_id"]
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user["user_id"]})
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
            "agency_id": user["agency_id"]
        }
    }

# Super Admin routes
@app.post("/api/admin/agencies")
async def create_agency(
    agency_data: AgencyCreate,
    current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    agency = {
        "agency_id": str(uuid.uuid4()),
        "name": agency_data.name,
        "email": agency_data.email,
        "phone": agency_data.phone,
        "address": agency_data.address,
        "description": agency_data.description,
        "status": "active",
        "created_at": datetime.utcnow()
    }
    
    db.agencies.insert_one(agency)
    return {"message": "Agency created successfully", "agency": agency}

@app.get("/api/admin/agencies")
async def get_agencies(current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    agencies = list(db.agencies.find({}, {"_id": 0}))
    return {"agencies": agencies}

@app.get("/api/admin/analytics")
async def get_admin_analytics(current_user: dict = Depends(require_role([UserRole.SUPER_ADMIN]))):
    total_agencies = db.agencies.count_documents({})
    total_cars = db.cars.count_documents({})
    total_bookings = db.bookings.count_documents({})
    active_agencies = db.agencies.count_documents({"status": "active"})
    
    return {
        "total_agencies": total_agencies,
        "active_agencies": active_agencies,
        "total_cars": total_cars,
        "total_bookings": total_bookings
    }

# Agency routes
@app.post("/api/agency/cars")
async def create_car(
    car_data: CarCreate,
    current_user: dict = Depends(require_role([UserRole.AGENCY_ADMIN, UserRole.STAFF]))
):
    # Verify agency access
    if current_user["role"] != UserRole.SUPER_ADMIN and current_user["agency_id"] != car_data.agency_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    car = {
        "car_id": str(uuid.uuid4()),
        "title": car_data.title,
        "model": car_data.model,
        "brand": car_data.brand,
        "year": car_data.year,
        "plate_number": car_data.plate_number,
        "color": car_data.color,
        "price_per_day": car_data.price_per_day,
        "features": car_data.features,
        "agency_id": car_data.agency_id,
        "status": "available",
        "created_at": datetime.utcnow()
    }
    
    db.cars.insert_one(car)
    return {"message": "Car added successfully", "car": car}

@app.get("/api/agency/{agency_id}/cars")
async def get_agency_cars(
    agency_id: str,
    current_user: dict = Depends(require_role([UserRole.AGENCY_ADMIN, UserRole.STAFF]))
):
    # Verify agency access
    if current_user["role"] != UserRole.SUPER_ADMIN and current_user["agency_id"] != agency_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    cars = list(db.cars.find({"agency_id": agency_id}, {"_id": 0}))
    return {"cars": cars}

@app.get("/api/agency/{agency_id}/bookings")
async def get_agency_bookings(
    agency_id: str,
    current_user: dict = Depends(require_role([UserRole.AGENCY_ADMIN, UserRole.STAFF]))
):
    # Verify agency access
    if current_user["role"] != UserRole.SUPER_ADMIN and current_user["agency_id"] != agency_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    bookings = list(db.bookings.find({"agency_id": agency_id}, {"_id": 0}))
    return {"bookings": bookings}

# Public routes
@app.get("/api/public/agencies/{agency_id}/cars")
async def get_public_cars(agency_id: str):
    cars = list(db.cars.find(
        {"agency_id": agency_id, "status": "available"}, 
        {"_id": 0}
    ))
    agency = db.agencies.find_one({"agency_id": agency_id}, {"_id": 0})
    
    return {"agency": agency, "cars": cars}

@app.post("/api/public/bookings")
async def create_booking(booking_data: BookingCreate):
    # Get car and agency info
    car = db.cars.find_one({"car_id": booking_data.car_id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    agency = db.agencies.find_one({"agency_id": car["agency_id"]})
    
    booking = {
        "booking_id": str(uuid.uuid4()),
        "car_id": booking_data.car_id,
        "agency_id": car["agency_id"],
        "client_email": booking_data.client_email,
        "client_name": booking_data.client_name,
        "client_phone": booking_data.client_phone,
        "pickup_date": booking_data.pickup_date,
        "return_date": booking_data.return_date,
        "pickup_location": booking_data.pickup_location,
        "return_location": booking_data.return_location,
        "message": booking_data.message,
        "status": "pending",
        "total_amount": car["price_per_day"] * (booking_data.return_date - booking_data.pickup_date).days,
        "created_at": datetime.utcnow()
    }
    
    db.bookings.insert_one(booking)
    return {"message": "Booking created successfully", "booking": booking}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)