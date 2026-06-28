from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logging must be configured before any code (e.g. the startup seed) references `logger`.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Configuration ----------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXP_MINUTES = int(os.environ.get('JWT_EXP_MINUTES', '1440'))
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']
EMERGENT_AUTH_DATA_URL = os.environ['EMERGENT_AUTH_DATA_URL']

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Spectral Forge API")
api_router = APIRouter(prefix="/api")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXP_MINUTES)
    payload = {"sub": user_id, "email": email, "role": role, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
Role = Literal["admin", "member"]


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    role: Role
    provider: str = "local"
    created_at: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class EmergentSessionRequest(BaseModel):
    session_id: str


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    tags: List[str] = []
    image_url: Optional[str] = None
    repo_url: Optional[str] = None
    status: Literal["in_progress", "completed", "planned"] = "in_progress"


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    repo_url: Optional[str] = None
    status: Optional[Literal["in_progress", "completed", "planned"]] = None


class ProjectPublic(BaseModel):
    id: str
    title: str
    description: str
    tags: List[str] = []
    image_url: Optional[str] = None
    repo_url: Optional[str] = None
    status: str
    owner_id: str
    owner_name: Optional[str] = None
    owner_email: Optional[EmailStr] = None
    created_at: str
    updated_at: str


class AnnouncementCreate(BaseModel):
    title: str
    body: str


class AnnouncementPublic(BaseModel):
    id: str
    title: str
    body: str
    created_at: str
    author: Optional[str] = None


class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class ContactPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: str


# ---------- Serializers ----------
def user_to_public(doc: dict) -> UserPublic:
    return UserPublic(
        id=doc["id"],
        email=doc["email"],
        name=doc.get("name"),
        role=doc["role"],
        provider=doc.get("provider", "local"),
        created_at=doc["created_at"],
    )


def project_to_public(doc: dict) -> ProjectPublic:
    return ProjectPublic(
        id=doc["id"],
        title=doc["title"],
        description=doc["description"],
        tags=doc.get("tags", []),
        image_url=doc.get("image_url"),
        repo_url=doc.get("repo_url"),
        status=doc.get("status", "in_progress"),
        owner_id=doc["owner_id"],
        owner_name=doc.get("owner_name"),
        owner_email=doc.get("owner_email"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


# ---------- Auth dependencies ----------
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Routes: auth ----------
@api_router.get("/")
async def root():
    return {"message": "Spectral Forge API", "status": "ok"}


@api_router.post("/auth/register", response_model=TokenResponse)
async def register(payload: RegisterRequest):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "name": payload.name,
        "hashed_password": hash_password(payload.password),
        "role": "member",
        "provider": "local",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], user_doc["email"], user_doc["role"])
    return TokenResponse(access_token=token, user=user_to_public(user_doc))


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not user.get("hashed_password") or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") == "admin":
        raise HTTPException(status_code=403, detail="Admins must use the admin login")
    token = create_access_token(user["id"], user["email"], user["role"])
    return TokenResponse(access_token=token, user=user_to_public(user))


@api_router.post("/auth/admin/login", response_model=TokenResponse)
async def admin_login(payload: AdminLoginRequest):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not user.get("hashed_password") or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin account")
    token = create_access_token(user["id"], user["email"], user["role"])
    return TokenResponse(access_token=token, user=user_to_public(user))


@api_router.post("/auth/emergent/session", response_model=TokenResponse)
async def emergent_session(payload: EmergentSessionRequest):
    """Convert an Emergent session_id (returned from Emergent Google login) into a local JWT."""
    async with httpx.AsyncClient(timeout=15.0) as http:
        r = await http.get(EMERGENT_AUTH_DATA_URL, headers={"X-Session-ID": payload.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Emergent session")
    data = r.json()
    email = (data.get("email") or "").lower()
    name = data.get("name") or data.get("full_name")
    if not email:
        raise HTTPException(status_code=400, detail="Emergent did not return an email")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        # ensure provider tracked but don't downgrade admins
        await db.users.update_one(
            {"id": existing["id"]},
            {"$set": {"name": existing.get("name") or name, "provider": existing.get("provider") or "emergent-google"}},
        )
        user = existing
    else:
        user = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "hashed_password": None,
            "role": "member",
            "provider": "emergent-google",
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)

    token = create_access_token(user["id"], user["email"], user["role"])
    return TokenResponse(access_token=token, user=user_to_public(user))


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(get_current_user)):
    return user_to_public(user)


# ---------- Routes: projects ----------
@api_router.get("/projects", response_model=List[ProjectPublic])
async def list_projects():
    docs = await db.projects.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [project_to_public(d) for d in docs]


@api_router.post("/projects", response_model=ProjectPublic)
async def create_project(payload: ProjectCreate, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "description": payload.description,
        "tags": payload.tags,
        "image_url": payload.image_url,
        "repo_url": payload.repo_url,
        "status": payload.status,
        "owner_id": user["id"],
        "owner_name": user.get("name") or user["email"].split("@")[0],
        "owner_email": user["email"],
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.projects.insert_one(doc)
    return project_to_public(doc)


@api_router.get("/projects/mine", response_model=List[ProjectPublic])
async def my_projects(user: dict = Depends(get_current_user)):
    docs = await db.projects.find({"owner_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [project_to_public(d) for d in docs]


@api_router.put("/projects/{project_id}", response_model=ProjectPublic)
async def update_project(project_id: str, payload: ProjectUpdate, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["owner_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    update_data = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    update_data["updated_at"] = now_iso()
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    project.update(update_data)
    return project_to_public(project)


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["owner_id"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    await db.projects.delete_one({"id": project_id})
    return {"ok": True}


# ---------- Routes: announcements ----------
@api_router.get("/announcements", response_model=List[AnnouncementPublic])
async def list_announcements():
    docs = await db.announcements.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [AnnouncementPublic(**d) for d in docs]


@api_router.post("/announcements", response_model=AnnouncementPublic)
async def create_announcement(payload: AnnouncementCreate, user: dict = Depends(require_admin)):
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "body": payload.body,
        "author": user.get("name") or user["email"],
        "created_at": now_iso(),
    }
    await db.announcements.insert_one(doc)
    return AnnouncementPublic(**doc)


@api_router.delete("/announcements/{ann_id}")
async def delete_announcement(ann_id: str, _: dict = Depends(require_admin)):
    await db.announcements.delete_one({"id": ann_id})
    return {"ok": True}


# ---------- Routes: contact ----------
@api_router.post("/contact", response_model=ContactPublic)
async def create_contact(payload: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": payload.email.lower(),
        "subject": payload.subject,
        "message": payload.message,
        "created_at": now_iso(),
    }
    await db.contacts.insert_one(doc)
    return ContactPublic(**doc)


@api_router.get("/admin/contacts", response_model=List[ContactPublic])
async def list_contacts(_: dict = Depends(require_admin)):
    docs = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [ContactPublic(**d) for d in docs]


@api_router.get("/admin/users", response_model=List[UserPublic])
async def list_users(_: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [user_to_public(d) for d in docs]


# ---------- Startup seeding ----------
@app.on_event("startup")
async def seed_initial_data():
    # ensure unique index on email
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.projects.create_index("id", unique=True)
    except Exception as e:
        logger.warning(f"index creation: {e}")

    # seed admin
    admin = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not admin:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "name": "Spectral Forge Admin",
            "hashed_password": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "provider": "local",
            "created_at": now_iso(),
        }
        await db.users.insert_one(admin_doc)
        logger.info("Seeded initial admin")

    # seed placeholder projects if none
    count = await db.projects.count_documents({})
    if count == 0:
        admin = await db.users.find_one({"email": ADMIN_EMAIL.lower()}, {"_id": 0})
        owner_id = admin["id"] if admin else "system"
        owner_name = admin.get("name") if admin else "Spectral Forge"
        owner_email = admin["email"] if admin else "admin@spectralforge.dev"
        seeds = [
            {
                "title": "Forge OS",
                "description": "An experimental microkernel-based learning OS used to teach systems programming fundamentals to club members.",
                "tags": ["systems", "rust", "kernel"],
                "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
                "repo_url": None,
                "status": "in_progress",
            },
            {
                "title": "Spectral Vision",
                "description": "Real-time computer vision pipeline for crowd-sourced photo analysis. CNN-based object detection running on edge devices.",
                "tags": ["ml", "python", "edge"],
                "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
                "repo_url": None,
                "status": "completed",
            },
            {
                "title": "ForgeChain",
                "description": "Permissioned ledger experiment for tracking club membership credentials and project authorship.",
                "tags": ["blockchain", "go"],
                "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200",
                "repo_url": None,
                "status": "planned",
            },
        ]
        for s in seeds:
            doc = {
                "id": str(uuid.uuid4()),
                **s,
                "owner_id": owner_id,
                "owner_name": owner_name,
                "owner_email": owner_email,
                "created_at": now_iso(),
                "updated_at": now_iso(),
            }
            await db.projects.insert_one(doc)
        logger.info(f"Seeded {len(seeds)} placeholder projects")

    # seed welcome announcement if none
    ann_count = await db.announcements.count_documents({})
    if ann_count == 0:
        await db.announcements.insert_one({
            "id": str(uuid.uuid4()),
            "title": "Welcome to Spectral Forge",
            "body": "We're a tech club where engineers, designers and curious builders meet to forge the future. Watch this space for hackathons, talks, and weekly project showcases.",
            "author": "Spectral Forge Admin",
            "created_at": now_iso(),
        })


# ---------- Mount ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
