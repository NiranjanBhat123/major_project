# major_project
FixNGo - A platform for local home service booking


## Features
- Django backend with Django REST Framework
- React.js frontend
- User authentication


## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 14+
- Docker (optional)

### Installation

1. Create a virtual environment and activate it:

```
python3 -m venv venv
source venv/bin/activate
```

2. Install the required Python packages:

```
pip install -r requirements.txt
```

3. Install the required Node.js packages:

```
cd frontend
npm install
```

4. Run the Django development server:

```
python manage.py runserver
```

5. Start the React.js development server:

```
cd frontend
npm start
```

The Django backend will be available at `http://localhost:8000` and the React.js frontend will be available at `http://localhost:3000`.



## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request
