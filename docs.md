# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE shoptrack;

# Exit
\q


# Navigate to backend
cd shoptrack/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run Migrations
# Make sure venv is activated
alembic upgrade head

# Run the Backend
uvicorn app.main:app --reload --port 8000


# Run the Test
cd shoptrack/backend
source venv/bin/activate
PYTHONPATH=. pytest tests/ -v


# Set up the frontend
cd shoptrack/frontend
npm install
cp .env.example .env

# Set env variable
VITE_API_URL=http://localhost:8000

# run front end
npm run dev