from flask import Flask, request, jsonify, render_template, send_file, session
import os
import requests
import tempfile
import zipfile
import subprocess
import sqlite3
import io
import ftplib
import base64
import json
import random
import string
from datetime import datetime, timedelta

from PIL import Image
import cv2
import numpy as np
import src.auto_complete as auto_complete
import src.syntax_check as syntax_check
import src.data_analysis as data_analysis

# Create downloads directory if it doesn't exist
os.makedirs('downloads', exist_ok=True)

def load_chats():
    try:
        with open('chats.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_chats_to_file(chats_data):
    with open('chats.json', 'w', encoding='utf-8') as f:
        json.dump(chats_data, f, indent=2, ensure_ascii=False)

def load_maintenance_status():
    try:
        with open('maintenance.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('maintenance', False)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

def save_maintenance_status(status):
    with open('maintenance.json', 'w', encoding='utf-8') as f:
        json.dump({'maintenance': status}, f, indent=2)

# Role-based access control functions
def get_user_role(key):
    """Get user role from keys.json"""
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return 'user'

    for k in keys:
        if k.get('key') == key:
            return k.get('role', 'user')
    return 'user'

def check_role_access(key, required_role):
    """Check if user has required role or higher"""
    user_role = get_user_role(key)
    role_hierarchy = {'user': 1, 'moderator': 2, 'admin': 3}
    return role_hierarchy.get(user_role, 1) >= role_hierarchy.get(required_role, 1)

def update_user_role(key_id, new_role):
    """Update user role in keys.json"""
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return False

    for key in keys:
        if key.get('id') == key_id or str(key.get('id')) == str(key_id):
            key['role'] = new_role
            with open('keys.json', 'w', encoding='utf-8') as f:
                json.dump(keys, f, indent=2)
            return True
    return False
# API configuration - Updated with multiple fallback endpoints
api_key = "sk-OnmpCkbSBBnZa10kT6PNdNLO6wIwg2pADjmYwXwYb8xmWxdO"
BASE_URLS = [
    "https://api.openai.com/v1",
    "https://api.chatanywhere.tech/v1",
    "https://api.chatanywhere.org/v1",
    "https://api.deepseek.com/v1",
    "https://api.groq.com/openai/v1",
    "https://api.anthropic.com/v1"
]
API_REDIRECTS = {
    "https://api.openai.com/v1/chat/completions": "https://api.chatanywhere.tech/v1/chat/completions",
    "https://api.deepseek.com/v1/chat/completions": "https://api.deepseek.com/v1/chat/completions",
    "https://api.groq.com/openai/v1/chat/completions": "https://api.groq.com/openai/v1/chat/completions"
}
MODEL = "gpt-5-nano"  # Changed to more compatible model

from flask import Blueprint

app = Flask(__name__, static_folder='web/static', template_folder='web')
app.secret_key = 'your_secret_key_here'  # Change to a secure key

admin_bp = Blueprint('admin', __name__, url_prefix='/admin', template_folder='web')

# Move admin routes to blueprint
@admin_bp.route('/')
def admin():
    return render_template('admin.html')

@admin_bp.route('/create_key', methods=['POST'])
def create_key():
    data = request.get_json()
    discord_name = data.get('discord_name')
    discord_id = data.get('discord_id')
    expiry_days = data.get('expiry_days', 30)

    # Generate key: "run" + 7 random digits
    random_digits = ''.join(random.choices('0123456789', k=7))
    key = f"run{random_digits}"

    expiry = (datetime.now() + timedelta(days=expiry_days)).isoformat()

    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []

    # Check if key already exists
    for k in keys:
        if k['key'] == key:
            return jsonify({'error': 'Key already exists'}), 400

    new_key = {
        'id': len(keys) + 1,
        'key': key,
        'created_at': datetime.now().isoformat(),
        'expiry': expiry,
        'active': True,
        'created_by': session.get('user_id', 1),
        'discord_name': discord_name,
        'discord_id': discord_id,
        'role': 'user'  # Default role
    }
    keys.append(new_key)

    with open('keys.json', 'w', encoding='utf-8') as f:
        json.dump(keys, f, indent=2)

    return jsonify({'key': key})

@admin_bp.route('/get_keys')
def get_keys():
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    return jsonify(keys)

@admin_bp.route('/delete_key', methods=['POST'])
def delete_key():
    data = request.get_json()
    key_id = data.get('key_id')
    if not key_id:
        return jsonify({'error': 'key_id required'}), 400
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    keys = [k for k in keys if k.get('id') != key_id and str(k.get('id')) != str(key_id)]
    with open('keys.json', 'w', encoding='utf-8') as f:
        json.dump(keys, f, indent=2)
    return jsonify({'success': True})

@admin_bp.route('/toggle_key', methods=['POST'])
def toggle_key():
    data = request.get_json()
    key_id = data.get('key_id')
    if not key_id:
        return jsonify({'error': 'key_id required'}), 400
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    for key in keys:
        if key.get('id') == key_id or str(key.get('id')) == str(key_id):
            key['active'] = not key.get('active', True)
            break
    with open('keys.json', 'w', encoding='utf-8') as f:
        json.dump(keys, f, indent=2)
    return jsonify({'success': True})

@admin_bp.route('/update_key_expiry', methods=['POST'])
def update_key_expiry():
    data = request.get_json()
    key_id = data.get('key_id')
    days = data.get('days')
    if not key_id or days is None:
        return jsonify({'error': 'key_id and days are required'}), 400
    try:
        days = int(days)
    except ValueError:
        return jsonify({'error': 'days must be an integer'}), 400
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    updated = False
    for key in keys:
        if key.get('id') == key_id or str(key.get('id')) == str(key_id):
            try:
                current_expiry = datetime.fromisoformat(key.get('expiry'))
            except Exception:
                current_expiry = datetime.now()
            new_expiry = current_expiry + timedelta(days=days)
            key['expiry'] = new_expiry.isoformat()
            updated = True
            break
    if updated:
        with open('keys.json', 'w', encoding='utf-8') as f:
            json.dump(keys, f, indent=2)
        return jsonify({'success': True, 'new_expiry': key['expiry']})
    else:
        return jsonify({'error': 'Key not found'}), 404

@admin_bp.route('/get_access_logs')
def get_access_logs():
    try:
        with open('access_logs.json', 'r', encoding='utf-8') as f:
            logs = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logs = []
    # Sort by accessed_at descending
    logs.sort(key=lambda x: x.get('accessed_at', ''), reverse=True)
    return jsonify(logs)

@admin_bp.route('/toggle_maintenance', methods=['POST'])
def toggle_maintenance():
    current_status = load_maintenance_status()
    new_status = not current_status
    save_maintenance_status(new_status)
    return jsonify({'success': True, 'maintenance': new_status})

@admin_bp.route('/update_user_role', methods=['POST'])
def update_user_role_route():
    data = request.get_json()
    key_id = data.get('key_id')
    new_role = data.get('role')
    if not key_id or not new_role:
        return jsonify({'error': 'key_id and role are required'}), 400
    if new_role not in ['user', 'moderator', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    success = update_user_role(key_id, new_role)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Key not found'}), 404

app.register_blueprint(admin_bp)

def init_db():
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS forum_posts (id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute('''CREATE TABLE IF NOT EXISTS shared_chats (id INTEGER PRIMARY KEY, chat_id TEXT, user_id INTEGER, shared_link TEXT UNIQUE)''')
    c.execute('''CREATE TABLE IF NOT EXISTS admin_keys (id INTEGER PRIMARY KEY, key TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, expiry DATETIME, active BOOLEAN DEFAULT 1, created_by INTEGER, FOREIGN KEY(created_by) REFERENCES users(id))''')
    c.execute('''CREATE TABLE IF NOT EXISTS key_access (id INTEGER PRIMARY KEY, key_id INTEGER, ip TEXT, accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(key_id) REFERENCES admin_keys(id))''')
    conn.commit()
    conn.close()

init_db()

# Add route to serve static files correctly
@app.route('/static/<path:filename>')
def static_files(filename):
    return app.send_static_file(filename)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/coding')
def coding():
    return render_template('coding.html')

@app.route('/test-script')
def test_script():
    return render_template('test-script.html')

@app.route('/forum-page')
def forum_page():
    return render_template('forum.html')

@app.route('/education')
def education():
    return render_template('education.html')



@app.route('/custom_instructions')
def custom_instructions_page():
    return render_template('custom_instructions.html')

@app.route('/image_analysis')
def image_analysis_page():
    return render_template('image_analysis.html')

@app.route('/sample_projects')
def sample_projects_page():
    return render_template('sample_projects.html')

@app.route('/whisper')
def whisper_page():
    return render_template('whisper.html')

from src.auto_complete import get_autocomplete_suggestions
from src.syntax_check import check_syntax

def generate_fivem_lua_code(messages, image=None, web_search=False, longer_thinking=False):
    system_prompt = """
You are an expert in FiveM Lua scripting. Generate highly detailed, optimized, and well-commented Lua code that is compatible with FiveM, using appropriate natives, events, and structures.
Ensure the code is syntactically correct, follows FiveM conventions (e.g., Citizen.CreateThread, TriggerEvent, RegisterNetEvent), includes extensive comments for clarity, and is production-ready.
Provide comprehensive explanations and best practices. Do not generate code outside of FiveM context unless specified.
"""
    if web_search:
        system_prompt += "\nYou have access to web search tools. Use them to provide up-to-date information when needed."
    # Fix: if messages is a string, convert to list with one user message dict
    if isinstance(messages, str):
        messages = [{"role": "user", "content": messages}]
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    if image:
        # For vision, adjust last message
        last_msg = full_messages[-1]
        if last_msg['role'] == 'user':
            full_messages[-1] = {"role": "user", "content": [
                {"type": "text", "text": last_msg['content']},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image}"}}
            ]}
        model = "gpt-5-nano"
    else:
        model = MODEL
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    max_tokens = 2000 if longer_thinking else 1000
    json_data = {
        "model": model,
        "messages": full_messages,
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    # Try each base URL in order
    failed_endpoints = []
    for base_url in BASE_URLS:
        try:
            # Check for API redirects
            url = API_REDIRECTS.get(f"{base_url}/chat/completions", f"{base_url}/chat/completions")
            print(f"Trying endpoint: {url}")
            response = requests.post(url, headers=headers, json=json_data, timeout=30)
            print(f"Response status: {response.status_code}")
            if response.status_code == 200:
                print(f"Success with endpoint: {base_url}")
                break
            else:
                failed_endpoints.append(f"{base_url} (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {base_url}: {str(e)}")
            failed_endpoints.append(f"{base_url} (Error: {str(e)})")
            continue
    else:
        error_msg = "Error: All API endpoints failed. Failed endpoints:\n" + "\n".join(f"- {endpoint}" for endpoint in failed_endpoints)
        print(error_msg)
        return error_msg
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    if response.status_code == 200:
        try:
            json_response = response.json()
            return json_response["choices"][0]["message"]["content"].strip()
        except Exception:
            return response.text.strip()
    else:
        return f"Error: {response.status_code} - {response.text}"

def generate_image(prompt, size="1024x1024"):
    # Whisper-1 supported sizes (assuming same as DALL-E-2 for compatibility)
    supported_sizes = ["256x256", "512x512", "1024x1024"]

    if size not in supported_sizes:
        size = "1024x1024"  # Default fallback

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": "whisper-1",
        "prompt": prompt,
        "n": 1,
        "size": size
    }
    # Try each base URL in order
    for base_url in BASE_URLS:
        try:
            # Check for API redirects
            url = API_REDIRECTS.get(f"{base_url}/images/generations", f"{base_url}/images/generations")
            response = requests.post(url, headers=headers, json=json_data, timeout=30)
            if response.status_code == 200:
                break
        except requests.exceptions.RequestException:
            continue
    else:
        return "Error: All API endpoints failed"
    print(f"Image Gen Status: {response.status_code}")
    print(f"Image Gen Response: {response.text}")
    if response.status_code == 200:
        json_response = response.json()
        return json_response["data"][0]["url"]
    else:
        return f"Error: {response.status_code} - {response.text}"

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    messages = data.get('messages', [])
    web_search = data.get('web_search', False)
    longer_thinking = data.get('longer_thinking', False)
    search_mode = data.get('search_mode', 'duckduckgo')
    image = None
    if messages and 'image' in messages[-1]:
        image = messages[-1]['image']
    if not messages:
        return jsonify({'error': 'No messages provided'}), 400
    # Map 'bot' role to 'assistant' for API compatibility
    for msg in messages:
        if msg.get('role') == 'bot':
            msg['role'] = 'assistant'
    # If web_search toggle is on, call the /search endpoint and append results to messages
    if web_search:
        last_user_message = next((msg for msg in reversed(messages) if msg['role'] == 'user'), None)
        if last_user_message:
            query = last_user_message['content']
            try:
                search_response = requests.post('http://localhost:5000/search', json={'query': query, 'mode': search_mode})
                if search_response.status_code == 200:
                    search_results = search_response.json().get('results', [])
                    # Append search results as a system message
                    search_text = "\n".join([f"{res['title']}: {res['snippet']}" for res in search_results])
                    messages.append({'role': 'system', 'content': f"Web search results:\n{search_text}"})
            except Exception as e:
                print(f"Web search failed: {e}")
    generated_code = generate_fivem_lua_code(messages, image=image, web_search=web_search, longer_thinking=longer_thinking)
    return jsonify({'code': generated_code})

@app.route('/generate_full', methods=['POST'])
def generate_full():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    full_prompt = f"""Generate a complete FiveM script based on this description: {prompt}.

Provide the code in the following exact format:

-- CLIENT.LUA --
[Insert the complete client-side Lua code here]

-- SERVER.LUA --
[Insert the complete server-side Lua code here]

-- FXMANIFEST.LUA --
[Insert the complete fxmanifest.lua content here]

Ensure all code is syntactically correct, follows FiveM conventions, and is ready to use. Include necessary events, threads, and comments."""

    generated = generate_fivem_lua_code(full_prompt)

    # Parse the response
    client_code = ""
    server_code = ""
    fxmanifest_code = ""

    parts = generated.split('-- ')
    for part in parts[1:]:  # Skip the first empty part
        if part.startswith('CLIENT.LUA --'):
            client_code = part.replace('CLIENT.LUA --', '').strip()
        elif part.startswith('SERVER.LUA --'):
            server_code = part.replace('SERVER.LUA --', '').strip()
        elif part.startswith('FXMANIFEST.LUA --'):
            fxmanifest_code = part.replace('FXMANIFEST.LUA --', '').strip()

    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    script_dir = os.path.join(temp_dir, 'fivem_script')
    os.makedirs(script_dir)

    # Write files
    with open(os.path.join(script_dir, 'client.lua'), 'w', encoding='utf-8') as f:
        f.write(client_code)
    with open(os.path.join(script_dir, 'server.lua'), 'w', encoding='utf-8') as f:
        f.write(server_code)
    with open(os.path.join(script_dir, 'fxmanifest.lua'), 'w', encoding='utf-8') as f:
        f.write(fxmanifest_code)

    # Create .rar archive using WinRAR
    rar_path = os.path.join(temp_dir, 'fivem_script.rar')
    subprocess.run(['C:\\Program Files\\WinRAR\\WinRAR.exe', 'a', '-r', rar_path, script_dir], check=True)

    # Return the file for download
    return send_file(rar_path, as_attachment=True, download_name='fivem_script.rar')

@app.route('/package_script', methods=['POST'])
def package_script():
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({'error': 'No code provided'}), 400

    # Use the provided code to generate the full script parts
    full_prompt = f"""Based on this Lua code snippet: {code}

Generate a complete FiveM script by expanding this code into proper client.lua, server.lua, and fxmanifest.lua files.

Provide the code in the following exact format:

-- CLIENT.LUA --
[Insert the complete client-side Lua code here, incorporating the provided snippet]

-- SERVER.LUA --
[Insert the complete server-side Lua code here, if applicable]

-- FXMANIFEST.LUA --
[Insert the complete fxmanifest.lua content here]

Ensure all code is syntactically correct, follows FiveM conventions, and is ready to use. Include necessary events, threads, and comments."""

    generated = generate_fivem_lua_code(full_prompt)

    # Parse the response
    client_code = ""
    server_code = ""
    fxmanifest_code = ""

    parts = generated.split('-- ')
    for part in parts[1:]:  # Skip the first empty part
        if part.startswith('CLIENT.LUA --'):
            client_code = part.replace('CLIENT.LUA --', '').strip()
        elif part.startswith('SERVER.LUA --'):
            server_code = part.replace('SERVER.LUA --', '').strip()
        elif part.startswith('FXMANIFEST.LUA --'):
            fxmanifest_code = part.replace('FXMANIFEST.LUA --', '').strip()

    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    script_dir = os.path.join(temp_dir, 'fivem_script')
    os.makedirs(script_dir)

    # Write files
    with open(os.path.join(script_dir, 'client.lua'), 'w', encoding='utf-8') as f:
        f.write(client_code)
    with open(os.path.join(script_dir, 'server.lua'), 'w', encoding='utf-8') as f:
        f.write(server_code)
    with open(os.path.join(script_dir, 'fxmanifest.lua'), 'w', encoding='utf-8') as f:
        f.write(fxmanifest_code)

    # Create .rar archive using WinRAR
    rar_path = os.path.join(temp_dir, 'fivem_script.rar')
    subprocess.run(['C:\\Program Files\\WinRAR\\WinRAR.exe', 'a', '-r', rar_path, script_dir], check=True)

    # Generate unique filename
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    filename = f'fivem_script_{timestamp}_{random_str}.rar'

    # Move rar to downloads directory
    downloads_path = os.path.join('downloads', filename)
    with open(rar_path, 'rb') as src, open(downloads_path, 'wb') as dst:
        dst.write(src.read())

    # Return download URL
    download_url = f'/download/{filename}'
    return jsonify({'download_url': download_url})

@app.route('/generate_image', methods=['POST'])
def generate_image_route():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    image_url = generate_image(prompt)
    return jsonify({'image_url': image_url})

from werkzeug.utils import secure_filename

def transcribe_audio(file, response_format="json", language=None):
    try:
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        files = {
            "file": (secure_filename(file.filename), file.stream, file.mimetype)
        }
        data = {
            "model": "whisper-1",
            "response_format": response_format
        }
        if language:
            data["language"] = language

        # Try each base URL in order
        for base_url in BASE_URLS:
            try:
                # Check for API redirects
                url = API_REDIRECTS.get(f"{base_url}/audio/transcriptions", f"{base_url}/audio/transcriptions")
                response = requests.post(url, headers=headers, files=files, data=data, timeout=30)
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                continue
        else:
            return {"error": "All API endpoints failed"}
        print(f"Whisper API Status: {response.status_code}")
        print(f"Whisper API Response: {response.text[:500]}")  # Log first 500 chars
        if response.status_code == 200:
            try:
                return response.json()
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                return {"error": "Invalid JSON response from API"}
        else:
            return {"error": f"API Error: {response.status_code} - {response.text}"}
    except Exception as e:
        print(f"Exception in transcribe_audio: {e}")

@app.route('/transcribe', methods=['POST'])
def transcribe_route():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        response_format = request.form.get('response_format', 'json')
        language = request.form.get('language', None)
        result = transcribe_audio(file, response_format=response_format, language=language)
        return jsonify(result)
    except Exception as e:
        print(f"Exception in transcribe_route: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/get_shared_chat', methods=['GET'])
def get_shared_chat():
    chat_id = request.args.get('chatId')
    # In a real app, store shared chats in DB
    # For demo, return a sample chat
    sample_chat = {
        'id': chat_id,
        'name': 'Shared Chat',
        'messages': [
            {'role': 'user', 'content': 'Sample prompt'},
            {'role': 'bot', 'content': '-- Sample code', 'name': 'Sample'}
        ]
    }
    return jsonify({'chat': sample_chat})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        session['user_id'] = c.lastrowid
        return jsonify({'success': True})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username exists'}), 400
    finally:
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    conn = sqlite3.connect('app.db')
    c = conn.cursor()
    c.execute('SELECT id FROM users WHERE username = ? AND password = ?', (username, password))
    user = c.fetchone()
    conn.close()
    if user:
        session['user_id'] = user[0]
        return jsonify({'success': True})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})

def load_forum_posts():
    """Load forum posts from konular.json"""
    try:
        with open('konular.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('posts', [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_forum_posts(posts):
    """Save forum posts to konular.json"""
    try:
        with open('konular.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {'posts': [], 'next_id': 1}

    data['posts'] = posts
    data['next_id'] = max([p.get('id', 0) for p in posts] + [0]) + 1

    with open('konular.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.route('/forum', methods=['GET', 'POST'])
def forum():
    if request.method == 'GET':
        posts = load_forum_posts()
        # Sort by timestamp descending
        posts.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return jsonify(posts)
    else:
        # Check authentication
        if 'access_granted' not in session or 'user_key' not in session:
            return jsonify({'success': False, 'error': 'Not logged in'}), 401

        user_key = session['user_key']
        user_role = get_user_role(user_key)

        # Check permissions
        if user_role not in ['user', 'moderator', 'admin']:
            return jsonify({'success': False, 'error': 'Insufficient permissions'}), 403

        try:
            data = request.get_json()
            if not data:
                return jsonify({'success': False, 'error': 'No data provided'}), 400

            title = data.get('title', '').strip()
            content = data.get('content', '').strip()

            if not title or not content:
                return jsonify({'success': False, 'error': 'Title and content are required'}), 400

            # Get user info
            discord_name = 'Misafir'
            try:
                with open('keys.json', 'r', encoding='utf-8') as f:
                    keys = json.load(f)
                for k in keys:
                    if k.get('key') == user_key:
                        discord_name = k.get('discord_name', 'Misafir')
                        break
            except:
                pass

            # Load current posts
            posts = load_forum_posts()

            # Get next ID
            try:
                with open('konular.json', 'r', encoding='utf-8') as f:
                    data_file = json.load(f)
                    next_id = data_file.get('next_id', 1)
            except:
                next_id = len(posts) + 1

            # Create new post
            new_post = {
                'id': next_id,
                'user_id': session.get('user_id', 1),
                'title': title,
                'content': content,
                'timestamp': datetime.now().isoformat(),
                'author': discord_name,
                'replies': []
            }

            # Add to posts
            posts.append(new_post)

            # Save posts
            save_forum_posts(posts)

            return jsonify({'success': True, 'post': new_post})

        except Exception as e:
            print(f"Forum POST error: {e}")
            return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/analyze_metrics', methods=['POST'])
def analyze_metrics():
    data = request.get_json()
    code = data['code']
    lines = len(code.split('\n'))
    functions = code.count('function')
    events = code.count('AddEventHandler') + code.count('RegisterNetEvent')
    threads = code.count('Citizen.CreateThread')
    return jsonify({'lines': lines, 'functions': functions, 'events': events, 'threads': threads})

@app.route('/tutorials')
def tutorials():
    tutorials = [
        {'title': 'FiveM Lua Basics', 'content': 'Learn basic Lua syntax for FiveM.'},
        {'title': 'Events and Threads', 'content': 'How to use events and threads in FiveM.'}
    ]
    return jsonify(tutorials)

@app.route('/templates')
def get_templates():
    try:
        with open('templates.json', 'r', encoding='utf-8') as f:
            templates = json.load(f)
        return jsonify(templates)
    except FileNotFoundError:
        return jsonify({'error': 'Templates file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid templates file'}), 500

@app.route('/natives')
def get_natives():
    try:
        with open('natives.json', 'r', encoding='utf-8') as f:
            natives = json.load(f)
        return jsonify(natives)
    except FileNotFoundError:
        return jsonify({'error': 'Natives file not found'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid natives file'}), 500

@app.route('/data_analysis', methods=['POST'])
def data_analysis_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    file_content = file.read()
    file_type = file.filename.split('.')[-1].lower()
    result = data_analysis.analyze_data(file_content, file_type)
    return jsonify(result)



@app.route('/get_maintenance_status')
def get_maintenance_status():
    status = load_maintenance_status()
    return jsonify({'maintenance': status})

@app.route('/check_key', methods=['POST'])
def check_key():
    data = request.get_json()
    key = data['key']
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    for k in keys:
        if k.get('key') == key:
            if not k.get('active', True):
                return jsonify({'error': 'Key deactivated'}), 401
            expiry_str = k.get('expiry')
            if expiry_str:
                expiry_dt = datetime.fromisoformat(expiry_str)
                if datetime.now() > expiry_dt:
                    return jsonify({'error': 'Key expired'}), 401
            # Log access
            try:
                with open('access_logs.json', 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                logs = []
            new_log = {
                'key': key,
                'ip': request.remote_addr,
                'accessed_at': datetime.now().isoformat()
            }
            logs.append(new_log)
            with open('access_logs.json', 'w', encoding='utf-8') as f:
                json.dump(logs, f, indent=2)
            session['access_granted'] = True
            session['user_key'] = key
            return jsonify({'success': True, 'key': key, 'discord_name': k.get('discord_name'), 'discord_id': k.get('discord_id')})
    return jsonify({'error': 'Invalid key'}), 401

@app.route('/hesabim')
def hesabim():
    if 'user_key' not in session:
        return "Unauthorized", 401
    user_key = session['user_key']
    try:
        with open('keys.json', 'r', encoding='utf-8') as f:
            keys = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        keys = []
    user_info = None
    for k in keys:
        if k.get('key') == user_key:
            user_info = k
            break
    if not user_info:
        return "User key not found", 404
    expiry = user_info.get('expiry', 'Unknown')
    discord_name = user_info.get('discord_name', 'Unknown')
    discord_id = user_info.get('discord_id', 'Unknown')
    version = "1.0.0"  # Sabit sürüm bilgisi, istenirse dinamik yapılabilir
    return render_template('hesabim.html', expiry=expiry, discord_name=discord_name, discord_id=discord_id, version=version)

@app.route('/get_user_key_suffix')
def get_user_key_suffix():
    if 'access_granted' in session and 'user_key' in session:
        key = session['user_key']
        suffix = key[-3:] if len(key) >= 3 else key

        # keys.json'dan Discord bilgilerini çek
        try:
            with open('keys.json', 'r', encoding='utf-8') as f:
                keys = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            keys = []

        discord_name = ''
        discord_id = ''
        user_role = 'user'
        for k in keys:
            if k.get('key') == key:
                discord_name = k.get('discord_name', '')
                discord_id = k.get('discord_id', '')
                user_role = k.get('role', 'user')
                break

        return jsonify({
            'success': True,
            'key_suffix': suffix,
            'discord_name': discord_name,
            'discord_id': discord_id,
            'role': user_role
        })
    return jsonify({'success': False})

@app.route('/get_chats', methods=['GET'])
def get_chats():
    if 'access_granted' not in session or 'user_key' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    user_key = session['user_key']
    all_chats = load_chats()
    user_chats = all_chats.get(user_key, [])
    return jsonify({'chats': user_chats})

@app.route('/save_chats', methods=['POST'])
def save_chats():
    if 'access_granted' not in session or 'user_key' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    data = request.get_json()
    user_chats = data.get('chats', [])
    user_key = session['user_key']
    all_chats = load_chats()
    all_chats[user_key] = user_chats
    save_chats_to_file(all_chats)
    return jsonify({'success': True})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    mode = data.get('mode', 'duckduckgo')  # Default to duckduckgo
    if not query:
        return jsonify({'error': 'No query provided'}), 400

    try:
        if mode == 'duckduckgo':
            # DuckDuckGo Instant Answer API
            url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
            response = requests.get(url)
            if response.status_code == 200:
                result = response.json()
                search_results = []
                if result.get('AbstractText'):
                    search_results.append({
                        'title': result.get('Heading', 'Abstract'),
                        'snippet': result.get('AbstractText'),
                        'url': result.get('AbstractURL', '')
                    })
                if result.get('RelatedTopics'):
                    for topic in result['RelatedTopics'][:5]:  # Limit to 5 results
                        if 'Text' in topic:
                            search_results.append({
                                'title': topic.get('FirstURL', 'Related Topic'),
                                'snippet': topic['Text'][:200] + '...' if len(topic['Text']) > 200 else topic['Text'],
                                'url': topic.get('FirstURL', '')
                            })
                return jsonify({'results': search_results})
            else:
                return jsonify({'error': 'DuckDuckGo API error'}), 500
        elif mode == 'google':
            # Placeholder for Google Custom Search API
            # Requires API key and CSE ID
            # For now, fallback to DuckDuckGo
            return search_duckduckgo(query)
        elif mode == 'bing':
            # Placeholder for Bing Search API
            # Requires API key
            # For now, fallback to DuckDuckGo
            return search_duckduckgo(query)
        else:
            return jsonify({'error': 'Invalid search mode'}), 400
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

def search_duckduckgo(query):
    url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1&skip_disambig=1"
    response = requests.get(url)
    if response.status_code == 200:
        result = response.json()
        search_results = []
        if result.get('AbstractText'):
            search_results.append({
                'title': result.get('Heading', 'Abstract'),
                'snippet': result.get('AbstractText'),
                'url': result.get('AbstractURL', '')
            })
        if result.get('RelatedTopics'):
            for topic in result['RelatedTopics'][:5]:
                if 'Text' in topic:
                    search_results.append({
                        'title': topic.get('FirstURL', 'Related Topic'),
                        'snippet': topic['Text'][:200] + '...' if len(topic['Text']) > 200 else topic['Text'],
                        'url': topic.get('FirstURL', '')
                    })
        return jsonify({'results': search_results})
    else:
        return jsonify({'error': 'DuckDuckGo API error'}), 500

@app.route('/analyze_file', methods=['POST'])
def analyze_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        file_content = file.read().decode('utf-8', errors='ignore')
        file_size = len(file_content)
        file_type = file.filename.split('.')[-1].lower()

        analysis = {
            'filename': file.filename,
            'size': file_size,
            'type': file_type,
            'lines': len(file_content.split('\n')),
            'characters': len(file_content)
        }

        # Basic syntax check for Lua files
        if file_type == 'lua':
            syntax_errors = []
            lines = file_content.split('\n')
            for i, line in enumerate(lines, 1):
                # Simple checks
                if 'function' in line and not line.strip().endswith('end'):
                    # Check for matching end
                    pass  # Simplified check
                if 'if' in line and 'then' not in line:
                    syntax_errors.append(f"Line {i}: 'if' without 'then'")
                if 'for' in line and 'do' not in line:
                    syntax_errors.append(f"Line {i}: 'for' without 'do'")
            analysis['syntax_errors'] = syntax_errors

        # Security scan (basic)
        security_issues = []
        if 'os.execute' in file_content:
            security_issues.append('Potentially dangerous: os.execute usage')
        if 'loadstring' in file_content:
            security_issues.append('Potentially dangerous: loadstring usage')
        analysis['security_issues'] = security_issues

        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


# Custom instructions storage (in-memory for demo)
custom_instructions = {}

@app.route('/custom_instructions', methods=['GET', 'POST'])
def custom_instructions_route():
    if request.method == 'POST':
        data = request.get_json()
        user_id = session.get('user_id', 'anonymous')
        instructions = data.get('instructions', '')
        custom_instructions[user_id] = instructions
        return jsonify({'success': True})
    else:
        user_id = session.get('user_id', 'anonymous')
        instructions = custom_instructions.get(user_id, '')
        return jsonify({'instructions': instructions})

# Image analysis endpoint
@app.route('/image_analysis', methods=['POST'])
def image_analysis():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    try:
        img_bytes = file.read()
        npimg = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        # Encode edges image to base64 to return
        _, buffer = cv2.imencode('.png', edges)
        edges_b64 = base64.b64encode(buffer).decode('utf-8')
        return jsonify({'edges_image': edges_b64})
    except Exception as e:
        return jsonify({'error': f'Image analysis failed: {str(e)}'}), 500

# Sample projects endpoint
@app.route('/sample_projects')
def sample_projects():
    try:
        with open('templates.json', 'r', encoding='utf-8') as f:
            templates = json.load(f)
        return jsonify(templates)
    except Exception as e:
        return jsonify({'error': f'Failed to load sample projects: {str(e)}'}), 500

@app.route('/download/<filename>')
def download_file(filename):
    try:
        return send_file(os.path.join('downloads', filename), as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5002, debug=True)
