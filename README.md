Download dependencies in npm:

```bash
npm init -y
npm i react react-dom react-router-dom cors express mongoose @google/generative-ai bcryptjs jsonwebtoken
npm i -D vite @vitejs/plugin-react concurrently
```

Create virtual env in root dir (ForgeLink)

```bash
python3 -m venv python/.venv
source python/.venv/bin/activate
```

Download dependencies in pip:

```bash
pip install browser-use python-dotenv playwright
python -m playwright install --with-deps chromium

```

In .env:

```bash
PORT=3000
GOOGLE_API_KEY=""
MONGODB_URI=""
NODE_ENV=development
PYTHON_BIN=python/.venv/bin/python
JWT_SECRET=
VITE_API_BASE=
```

API: local host port 3000
WEB: local host 5173
