# FixNGo

https://github.com/user-attachments/assets/0fb70ec9-ee4b-4102-9b03-59d49ecd6080

https://github.com/user-attachments/assets/f870fae0-af3a-4ba3-8b6d-71fc68844cdc

FixNGo - A platform for local home service booking

https://github.com/user-attachments/assets/08480f4a-0691-4c72-bd86-cc62b252e4c0

## Features
- Listing the nearest service providers who provide the necessary services at your doorstep
- Service provider face verification using deepface models
- Service provider rating and review system
- Booking a service with the service provider at desired date and time
- User profile management
- Service provider profile management
- Maps integration to set the client location
- Chat feature with images (requires Redis)

## Installation and Setup

### 1. Cloning the Project

First, clone the repository to your local system:

```sh
git clone https://github.com/your-username/FixNGo.git
cd FixNGo
```

### 2. Setting up the Backend (Django)

#### Prerequisites
- Python 3.9+
- Redis

#### Installation Steps

1. Navigate to the backend directory:
   ```sh
   cd backend
   ```

2. Create and activate a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   venv\Scripts\activate  # On Windows
   ```

3. Install the required Python packages:
   ```sh
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```sh
   python manage.py migrate
   ```

5. Start the Django development server:
   ```sh
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000`.
   <br>Also ensure Redis is installed and running before starting the server.

### 3. Setting up the Frontend (Client & Service Provider)

#### Prerequisites
- Node.js 14+

#### Client Frontend Setup

1. Navigate to the client frontend directory:
   ```sh
   cd frontend/client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the client frontend:
   ```sh
   npm start
   ```
   The client frontend will be available at `http://localhost:3000`.

#### Service Provider Frontend Setup

1. Navigate to the service provider frontend directory:
   ```sh
   cd frontend/service-provider
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the service provider frontend:
   ```sh
   npm start
   ```
   The service provider frontend will be available at `http://localhost:3001`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request
