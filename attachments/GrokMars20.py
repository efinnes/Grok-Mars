# GrokMars v26.9 (Juno Avatar Integration)
# • NEW: Added "Holodeck" AvatarWidget using PyQt6-WebEngine & Three.js.
# • UI: Replaced main text area with 3D Avatar View (Juno.vrm).
# • CORE: Maintained Ellipsoid Geometry & Latitude Warping fixes.

import sys
import os
import json
import urllib.request
import requests
import numpy as np
import imageio.v3 as iio
from PIL import Image
import vtk
import pyttsx3
import re
import pythoncom
import threading
import math
import time
import subprocess
import base64 # Required for Avatar Loading

# === Import Rasterio ===
try:
    import rasterio
except ImportError:
    print("CRITICAL: Rasterio not found. Please run 'pip install rasterio'")
    sys.exit(1)

# === Import PyQt6 WebEngine (For Avatar) ===
try:
    from PyQt6.QtWebEngineWidgets import QWebEngineView
    from PyQt6.QtWebEngineCore import QWebEngineSettings
except ImportError:
    print("CRITICAL: PyQt6-WebEngine not found. Please run 'pip install PyQt6-WebEngine'")
    sys.exit(1)

import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

os.environ['PYTHONUNBUFFERED'] = '1'

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QDockWidget, QWidget, QVBoxLayout, 
    QTextEdit, QSlider, QLabel, QGroupBox, QCheckBox, QHBoxLayout,
    QFileDialog, QMenu, QInputDialog, QMessageBox, QPushButton
)
from PyQt6.QtCore import Qt, QTimer, QThread, pyqtSignal, QEvent, QPoint
from PyQt6.QtGui import QCursor, QFont, QAction, QIcon

import pyvista as pv
from pyvistaqt import QtInteractor

# === Configuration ===
# Mars Geodesy (Kilometers)
MARS_A = 3396.19  # Semi-Major (Equator)
MARS_B = 3376.20  # Semi-Minor (Poles)
Image.MAX_IMAGE_PIXELS = None 

# === DATA PATHS ===
LAYER_PATHS = {
    "Gravity Free Air": r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\mars_cyl_freeair.tif",
    "Gravity Bouguer":  r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\mars_cyl_bouguer.tif",
    "Crustal Thickness":r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\mars_cyl_thick.tif",
    "Mag Field (Lillis 8K)": r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Mars_Lillis_Mag_8K_Solid_Vibrant.tif",
    "Topography": r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\mars_cyl_topo.tif",
    "Shallow Ice (SWIM 0-1m)": r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\SWIMProducts\SWIM4MIM_Ci_0_1.tif",
    "Visual Ice Features (Geomorphology)": r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\SWIMProducts\SWIM4MIM_G_0_1.tif"
}

# === HYBRID KNOWLEDGE BASE ===
GEO_DATABASE = {
    "North Pole":       {"lat": 90.0,  "lon": 0.0},
    "South Pole":       {"lat": -90.0, "lon": 0.0},
    "Olympus Mons":     {"lat": 18.65, "lon": -133.8},
    "Valles Marineris": {"lat": -10.0, "lon": -72.0},
    "Gale Crater":      {"lat": -5.4,  "lon": 137.8},
    "Jezero Crater":    {"lat": 18.4,  "lon": 77.5},
    "Isidis Planitia":  {"lat": 13.0,  "lon": 87.0},
    "Utopia Planitia":  {"lat": 46.7,  "lon": 117.5},
    "Hellas Basin":     {"lat": -42.4, "lon": 70.5},
    "Elysium Mons":     {"lat": 25.0,  "lon": 147.0},
    "Tharsis Montes":   {"lat": 0.0,   "lon": -110.0},
    "Argyre Basin":     {"lat": -49.3, "lon": 318.0},
    "Arabia Terra":     {"lat": 21.0,  "lon": 6.0},
    "Acidalia Planitia":{"lat": 49.8,  "lon": -20.0},
    "Terra Sabaea":     {"lat": 2.0,   "lon": 42.0}
}

# === WORKER THREADS ===

class VoiceWorker(QThread):
    finished_speaking = pyqtSignal()
    
    def __init__(self, text):
        super().__init__()
        self.text = text

    def run(self):
        try:
            pythoncom.CoInitialize()
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            voices = engine.getProperty('voices')
            for voice in voices:
                if "zira" in voice.name.lower() or "female" in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
            engine.say(self.text)
            engine.runAndWait()
        except Exception as e:
            print(f"Voice Error: {e}")
        finally:
            self.finished_speaking.emit()

class AIWorker(QThread):
    response_ready = pyqtSignal(str)
    error_occurred = pyqtSignal(str)

    def __init__(self, messages, model="llama3.2"):
        super().__init__()
        self.messages = messages
        self.model = model

    def run(self):
        try:
            r = requests.post("http://localhost:11434/api/chat", json={
                "model": self.model,
                "messages": self.messages, 
                "stream": False
            }, timeout=30)
            
            if r.status_code == 200:
                resp = r.json()['message']['content']
                self.response_ready.emit(resp)
            else:
                self.error_occurred.emit("Error: AI Server returned " + str(r.status_code))
        except Exception as e:
            self.error_occurred.emit(str(e))

# === NEW: AVATAR WIDGET (Three.js / WebEngine) ===
class AvatarWidget(QWebEngineView):
    def __init__(self, vrm_path):
        super().__init__()
        # 1. Configure for 3D Rendering
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.WebGLEnabled, True)
        self.setStyleSheet("background: transparent;")
        self.page().setBackgroundColor(Qt.GlobalColor.transparent)

        # 2. Load the "Holodeck" (The HTML/JS Engine)
        self.setHtml(self.get_html_template())

        # 3. Inject the Avatar File safely once loaded
        self.loadFinished.connect(lambda: self.inject_avatar(vrm_path))

    def inject_avatar(self, path):
        if not os.path.exists(path):
            print(f"Error: Avatar not found at {path}")
            return
            
        # Read VRM as binary, convert to Base64 to bypass browser security
        try:
            with open(path, "rb") as f:
                b64_data = base64.b64encode(f.read()).decode('utf-8')
            
            print("Injecting Avatar Data...")
            # Send data to the internal JavaScript engine
            self.page().runJavaScript(f"loadVRMFromBase64('{b64_data}');")
        except Exception as e:
            print(f"Avatar Injection Error: {e}")

    def get_html_template(self):
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style> body { margin: 0; overflow: hidden; background-color: #1e1e1e; } </style>
            <script type="importmap">
                {
                    "imports": {
                        "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
                        "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/",
                        "@pixiv/three-vrm": "https://unpkg.com/@pixiv/three-vrm@3.3.0/lib/three-vrm.module.js"
                    }
                }
            </script>
        </head>
        <body>
            <script type="module">
                import * as THREE from 'three';
                import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
                import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

                // --- 1. Setup Scene ---
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                document.body.appendChild(renderer.domElement);

                const scene = new THREE.Scene();
                // Simple camera setup for portrait avatar view
                const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
                camera.position.set(0.0, 1.4, 1.5); // Adjust height to face level

                // Lighting
                const light = new THREE.DirectionalLight(0xffffff, 1.5);
                light.position.set(1.0, 1.0, 1.0).normalize();
                scene.add(light);
                scene.add(new THREE.AmbientLight(0x404040));

                let currentVrm = null;
                const clock = new THREE.Clock();

                // --- 2. Loader Logic ---
                const loader = new GLTFLoader();
                loader.register((parser) => new VRMLoaderPlugin(parser));

                window.loadVRMFromBase64 = function(b64) {
                    const binaryString = window.atob(b64);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }

                    loader.parse(bytes.buffer, '', (gltf) => {
                        if (currentVrm) scene.remove(currentVrm.scene);
                        const vrm = gltf.userData.vrm;
                        VRMUtils.removeUnnecessaryVertices(gltf.scene);
                        VRMUtils.combineSkeletons(gltf.scene);
                        vrm.scene.rotation.y = Math.PI; // Face forward
                        
                        scene.add(vrm.scene);
                        currentVrm = vrm;
                        console.log("Avatar Loaded!");
                    }, (err) => console.error(err));
                }

                // --- 3. Animation Loop ---
                function animate() {
                    requestAnimationFrame(animate);
                    if (currentVrm) currentVrm.update(clock.getDelta());
                    renderer.render(scene, camera);
                }
                animate();

                // Handle Resize
                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });
            </script>
        </body>
        </html>
        """

# === Main Application ===

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Grok Mars v26.9 - Juno Avatar Integration")
        self.resize(1920, 1200)

        self.plotter = QtInteractor(self)
        self.setCentralWidget(self.plotter)
        self.plotter.camera.clipping_range = (1.0, 400000)
        self.plotter.set_background("black")
        self.plotter.setMouseTracking(True)
        
        self.installEventFilter(self)
        self.plotter.installEventFilter(self)

        self.layer_textures = {}
        self.layer_actors = {}
        self.layer_controls = {} 
        self.dynamic_layer_group_layout = None 
        
        self.draw_mode_active = False
        self.is_dragging_roi = False
        self.draw_start_pos = None
        self.roi_actor = None
        self.roi_bounds = None 

        self.init_menu() 
        self.setup_ui()
        self.setup_hud()
        self.init_mars_data()

        self.anim_timer = QTimer(self)
        self.anim_timer.timeout.connect(self.update_animation)
        self.tour_queue = []
        self.is_tour_active = False
        self.camera_moving = False
        self.voice_speaking = False
        
        self.current_lat = None
        self.current_lon = None
        self.last_hud_update = 0

        self.system_prompt = {
            "role": "system", 
            "content": (
                "You are the Navigation Computer for a Mars Rover. Analyze the user command and output strictly structured JSON.\n"
                "RULES:\n"
                "1. IF user wants to MOVE to a specific place ('Go to Gale', 'Take me to Olympus'):\n"
                "   RETURN: {'type': 'location', 'name': 'Name', 'lat': 0.0, 'lon': 0.0, 'desc': 'Brief arrival announcement.'}\n"
                "2. IF user wants a SEQUENCE or GUIDE ('Tour', 'Show me around'):\n"
                "   RETURN: {'type': 'tour', 'sites': [{'name': 'Name', 'lat': 0.0, 'lon': 0.0, 'desc': 'Info'}, ...]}\n"
                "3. IF user asks a QUESTION or wants INFO ('Tell me about', 'How high is...'):\n"
                "   RETURN: {'type': 'knowledge', 'content': 'Detailed, conversational answer.'}\n"
            )
        }

    def init_menu(self):
        file_menu = self.menuBar().addMenu("&File")
        add_layer_action = QAction("Add External Layer...", self)
        add_layer_action.triggered.connect(self.manual_add_layer)
        file_menu.addAction(add_layer_action)
        export_chat_action = QAction("Export AI Report...", self)
        export_chat_action.triggered.connect(self.export_chat_report)
        file_menu.addAction(export_chat_action)
        screenshot_action = QAction("Save Screenshot", self)
        screenshot_action.triggered.connect(self.save_screenshot)
        file_menu.addAction(screenshot_action)
        exit_action = QAction("Exit", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        analysis_menu = self.menuBar().addMenu("&Analysis")
        draw_roi_action = QAction("Draw Region of Interest (Box)", self)
        draw_roi_action.setShortcut("Ctrl+D")
        draw_roi_action.triggered.connect(self.activate_draw_mode)
        analysis_menu.addAction(draw_roi_action)
        clear_roi_action = QAction("Clear Region", self)
        clear_roi_action.triggered.connect(self.clear_roi)
        analysis_menu.addAction(clear_roi_action)
        analysis_menu.addSeparator()
        trend_action = QAction("Remove Regional Trend", self)
        trend_action.triggered.connect(lambda: self.trigger_analysis("Trend Removal", "trend"))
        analysis_menu.addAction(trend_action)
        deriv1_action = QAction("Calc 1st Vertical Derivative", self)
        deriv1_action.triggered.connect(lambda: self.trigger_analysis("1st Vertical Derivative", "1vd"))
        analysis_menu.addAction(deriv1_action)
        deriv2_action = QAction("Calc 2nd Vertical Derivative", self)
        deriv2_action.triggered.connect(lambda: self.trigger_analysis("2nd Vertical Derivative", "2vd"))
        analysis_menu.addAction(deriv2_action)

        view_menu = self.menuBar().addMenu("&View")
        hud_action = QAction("Toggle HUD", self)
        hud_action.triggered.connect(self.toggle_hud)
        view_menu.addAction(hud_action)
        reset_cam_action = QAction("Reset Camera", self)
        reset_cam_action.triggered.connect(self.reset_camera)
        view_menu.addAction(reset_cam_action)

    def setup_ui(self):
        self.layer_dock = QDockWidget("Geophysics & Layers", self)
        self.layer_dock.setMinimumWidth(320)
        self.addDockWidget(Qt.LeftDockWidgetArea, self.layer_dock)

        layer_container = QWidget()
        layer_layout = QVBoxLayout(layer_container)
        
        terrain_group = QGroupBox("Base Terrain")
        t_layout = QVBoxLayout()
        self.terrain_slider = QSlider(Qt.Orientation.Horizontal)
        self.terrain_slider.setMinimum(0)
        self.terrain_slider.setMaximum(100)
        self.terrain_slider.setValue(20)
        self.terrain_slider.sliderReleased.connect(self.update_terrain_mesh)
        t_layout.addWidget(QLabel("Exaggeration"))
        t_layout.addWidget(self.terrain_slider)
        terrain_group.setLayout(t_layout)
        layer_layout.addWidget(terrain_group)

        geo_group = QGroupBox("Data Layers")
        add_btn = QPushButton("+")
        add_btn.setFixedWidth(30)
        add_btn.clicked.connect(self.manual_add_layer)
        add_btn.setStyleSheet("background-color: #333; color: white; font-weight: bold;")
        
        self.dynamic_layer_group_layout = QVBoxLayout() 
        btn_row = QHBoxLayout()
        btn_row.addStretch()
        btn_row.addWidget(QLabel("Add Layer:"))
        btn_row.addWidget(add_btn)
        self.dynamic_layer_group_layout.addLayout(btn_row)
        
        for name in LAYER_PATHS.keys():
            self.create_layer_control(name, self.dynamic_layer_group_layout)

        geo_group.setLayout(self.dynamic_layer_group_layout)
        layer_layout.addWidget(geo_group)
        layer_layout.addStretch()
        self.layer_dock.setWidget(layer_container)

        # === MISSION CONTROL (Modified for Avatar) ===
        self.chat_dock = QDockWidget("Mission Control", self)
        self.chat_dock.setMinimumWidth(380)
        self.addDockWidget(Qt.RightDockWidgetArea, self.chat_dock)
        
        chat_container = QWidget()
        chat_layout = QVBoxLayout(chat_container)
        
        # --- 1. AVATAR WIDGET ---
        avatar_path = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Avatar\Juno.vrm"
        self.avatar_view = AvatarWidget(avatar_path)
        self.avatar_view.setMinimumHeight(400) # Give space for character
        chat_layout.addWidget(self.avatar_view)

        # --- 2. TEXT LOG (Reduced size, replaces old full screen text) ---
        self.chat_out = QTextEdit()
        self.chat_out.setMaximumHeight(150) # Smaller log window
        self.chat_out.setReadOnly(True)
        self.chat_out.setStyleSheet("background-color: #1e1e1e; color: #00ff00; font-family: Consolas;")
        self.chat_out.setPlaceholderText("Mission Logs...")
        chat_layout.addWidget(self.chat_out)
        
        # --- 3. INPUT BOX ---
        self.chat_in = QTextEdit()
        self.chat_in.setMaximumHeight(60)
        self.chat_in.setPlaceholderText("Type command or Hover+SPACE...")
        chat_layout.addWidget(self.chat_in)
        
        self.chat_dock.setWidget(chat_container)
        self.chat_in.installEventFilter(self)

    def create_layer_control(self, name, layout):
        row_widget = QWidget()
        row = QHBoxLayout(row_widget)
        row.setContentsMargins(0,0,0,0)
        chk = QCheckBox(name)
        chk.setChecked(False)
        chk.toggled.connect(lambda checked, n=name: self.toggle_layer(n, checked))
        slider = QSlider(Qt.Orientation.Horizontal)
        slider.setRange(0, 100)
        slider.setValue(60)
        slider.setEnabled(False)
        slider.valueChanged.connect(lambda val, n=name: self.update_layer_opacity(n, val))
        row.addWidget(chk)
        row.addWidget(slider)
        layout.addWidget(row_widget)
        self.layer_controls[name] = {'chk': chk, 'slider': slider}

    def setup_hud(self):
        self.coord_label = QLabel(self.plotter)
        self.coord_label.setStyleSheet("color: lime; font-weight: bold; background-color: rgba(0,0,0,150); padding: 5px;")
        self.coord_label.setFont(QFont("Consolas", 12))
        self.coord_label.setText("INITIALIZING SYSTEMS...")
        self.coord_label.move(20, self.plotter.height() - 50) 
        self.coord_label.resize(400, 30)

    def resizeEvent(self, event):
        if hasattr(self, 'coord_label'):
            self.coord_label.move(20, self.plotter.height() - 50)
        super().resizeEvent(event)

    # === FIX: FORCE UV GENERATION FOR ANY MESH ===
    def generate_spherical_uvs(self, mesh):
        """Calculates and assigns explicit UV coordinates based on spherical projection."""
        pts = mesh.points
        # Normalize to unit sphere for UV calc (ignore ellipsoid squash)
        x, y, z = pts.T
        r = np.sqrt(x**2 + y**2 + z**2)
        r[r == 0] = 1.0 # Avoid divide by zero
        xn, yn, zn = x/r, y/r, z/r
        
        u = 0.5 + np.arctan2(yn, xn) / (2 * np.pi)
        v = 0.5 + np.arcsin(zn) / np.pi
        
        mesh.active_texture_coordinates = np.column_stack((u, v))

    def init_mars_data(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        tex_dir = os.path.join(script_dir, "textures")
        os.makedirs(tex_dir, exist_ok=True)
        
        self.color_path = os.path.join(tex_dir, "8k_mars.jpg")
        self.height_path = os.path.join(tex_dir, "mars_elevation.jpg")

        self.download_texture(self.color_path, "https://www.solarsystemscope.com/textures/download/8k_mars.jpg")
        self.download_texture(self.height_path, "https://www.solarsystemscope.com/textures/download/8k_mars_normal.jpg") 

        print("Generating Geometry...")
        self.sphere_res_theta = 400 
        self.sphere_res_phi = 200
        
        # Use Standard Sphere but SCALE it to Ellipsoid
        self.base_sphere = pv.Sphere(radius=1.0, theta_resolution=self.sphere_res_theta, phi_resolution=self.sphere_res_phi)
        self.base_sphere.points *= np.array([MARS_A, MARS_A, MARS_B])
        
        # === FORCE UVs on Base Sphere ===
        self.generate_spherical_uvs(self.base_sphere)

        if os.path.exists(self.color_path):
            print("Loading Base Texture...")
            try:
                base_img = Image.open(self.color_path).convert("RGB")
                base_data = np.array(base_img)
                if len(base_data.shape) == 3:
                     first_col = base_data[:, 0:1, :]
                     base_data_wrapped = np.concatenate((base_data, first_col), axis=1)
                     self.texture = pv.Texture(base_data_wrapped)
                else:
                     self.texture = pv.Texture(base_data)
                self.texture.Repeat = True 
            except Exception as e:
                 print(f"Error loading base texture: {e}")
                 self.texture = pv.Texture(iio.imread(self.color_path))
        
        print("Loading Geophysical Layers...")
        for name, path in LAYER_PATHS.items():
            tex = self.load_texture_safe_wrapped(path)
            if tex:
                self.layer_textures[name] = tex
                print(f"[OK] Loaded {name}")

        print("Processing Terrain Data...")
        try:
            if os.path.exists(self.height_path):
                img = Image.open(self.height_path).convert('L')
                img = img.resize((self.sphere_res_theta + 1, self.sphere_res_phi + 1))
                img = img.transpose(Image.FLIP_TOP_BOTTOM) 
                
                # Flatten Column-Major ('F') to match PyVista Sphere point order
                self.height_data = np.array(img).flatten(order='F')
                self.height_data = self.height_data / 255.0
                self.base_sphere.point_data["Elevation"] = self.height_data
            else:
                self.height_data = None
        except Exception as e:
            print(f"Terrain Error: {e}")
            self.height_data = None

        self.current_mesh_actor = None
        self.update_terrain_mesh()
        self.plotter.camera_position = [(12000, 0, 0), (0, 0, 0), (0, 0, 1)]

    def load_texture_safe_wrapped(self, path):
        if not os.path.exists(path): return None
        try:
            with rasterio.open(path) as src:
                data = src.read()
                _, h, w = data.shape
                # Check for Global vs Regional
                b = src.bounds
                width_units = abs(b.right - b.left)
                is_global = False
                
                if width_units > 360:
                    is_global = True # Un-georeferenced or just huge global map
                elif abs((w / h) - 2.0) < 0.1:
                    is_global = True # Aspect ratio check
                
                data = data.transpose(1, 2, 0)
                data = np.flipud(data)
                data = np.ascontiguousarray(data)
            
            if data.shape[2] == 1: data = data[:, :, 0]

            if data.dtype.kind == 'f': 
                vmin, vmax = np.percentile(data[~np.isnan(data)], [2, 98])
                norm = mcolors.Normalize(vmin=vmin, vmax=vmax)
                cmap = plt.get_cmap('RdBu')
                colored_data = cmap(norm(data)) 
                
                if "1vd" in path.lower() or "2vd" in path.lower() or "trend" in path.lower():
                     alpha_mask = np.ones_like(data)
                     alpha_mask[data == 0] = 0
                else:
                     abs_val = np.abs(data)
                     alpha_mask = np.clip(abs_val / (np.nanmax(abs_val) + 1e-9), 0, 1) 
                
                if colored_data.shape[2] == 4:
                    colored_data[:, :, 3] = alpha_mask
                data_wrapped = (colored_data * 255).astype(np.uint8)
            else:
                if len(data.shape) == 2:
                     data_wrapped = np.stack((data,)*3, axis=-1)
                else:
                     data_wrapped = data

            # Wrap seams only if global
            if is_global and len(data_wrapped.shape) == 3 and data_wrapped.shape[1] > 1:
                first_col = data_wrapped[:, 0:1, :] 
                data_final = np.concatenate((data_wrapped, first_col), axis=1)
                tex = pv.Texture(data_final)
            else:
                tex = pv.Texture(data_wrapped)
            tex.Repeat = True 
            return tex
        except Exception as e:
            print(f"Error loading {path}: {e}")
            return None

    def download_texture(self, path, url):
        if not os.path.exists(path):
            try: urllib.request.urlretrieve(url, path)
            except: pass

    def update_terrain_mesh(self):
        exaggeration = self.terrain_slider.value() * 25.0 / 100.0 * 100.0
        if self.current_mesh_actor:
            self.plotter.remove_actor(self.current_mesh_actor)

        if self.height_data is not None:
            self.warped_mesh = self.base_sphere.warp_by_scalar(scalars="Elevation", factor=exaggeration)
        else:
            self.warped_mesh = self.base_sphere

        # === FIX: Safe check for None ===
        if self.warped_mesh.active_texture_coordinates is None:
             self.generate_spherical_uvs(self.warped_mesh)

        try:
            self.current_mesh_actor = self.plotter.add_mesh(
                self.warped_mesh, 
                texture=self.texture if hasattr(self, 'texture') else None, 
                smooth_shading=True, specular=0.2
            )
        except Exception as e:
            print(f"Terrain Texture Error: {e}")
            self.current_mesh_actor = self.plotter.add_mesh(self.warped_mesh, color="orange")

    def toggle_layer(self, name, is_checked):
        controls = self.layer_controls[name]
        controls['slider'].setEnabled(is_checked)
        if is_checked: self.add_layer_actor(name)
        else: self.remove_layer_actor(name)

    def update_layer_opacity(self, name, value):
        if name in self.layer_actors:
            self.layer_actors[name].GetProperty().SetOpacity(value / 100.0)
            self.plotter.render()

    def add_layer_actor(self, name):
        if name not in self.layer_textures:
            if name in LAYER_PATHS:
                tex = self.load_texture_safe_wrapped(LAYER_PATHS[name])
                if tex: self.layer_textures[name] = tex
                else: return
            else: return

        if name in self.layer_actors: return
        
        path = LAYER_PATHS[name]
        is_regional = False
        bounds = (-180, -90, 180, 90) 

        try:
            with rasterio.open(path) as src:
                b = src.bounds
                width_units = abs(b.right - b.left)
                if width_units < 360:
                    is_regional = True
                    bounds = (b.left, b.bottom, b.right, b.top)
                    print(f"Detected Regional Layer: {bounds}")
        except: pass 

        layer_keys = list(LAYER_PATHS.keys())
        if name in layer_keys: index = layer_keys.index(name)
        else: index = len(layer_keys) + 1
        offset = 50.0 + (index * 5.0) 
        
        layer_a = MARS_A + offset
        layer_b = MARS_B + offset

        if is_regional:
            min_lon, min_lat, max_lon, max_lat = bounds
            
            lat_range = abs(max_lat - min_lat)
            lon_range = abs(max_lon - min_lon)
            if lat_range == 0: lat_range = 1
            aspect = lon_range / lat_range
            
            res_lat = 100
            res_lon = int(100 * aspect) 
            if res_lon > 400: res_lon = 400
            
            lon = np.linspace(min_lon, max_lon, res_lon)
            lat = np.linspace(min_lat, max_lat, res_lat)
            
            lon_grid, lat_grid = np.meshgrid(lon, lat) 
            
            # Warp Ocentric -> Ographic
            lat_rad_oc = np.radians(lat_grid)
            flattening_squared = (MARS_A / MARS_B) ** 2
            lat_rad_og = np.arctan(np.tan(lat_rad_oc) * flattening_squared)
            lon_rad = np.radians(lon_grid)
            
            x = layer_a * np.cos(lat_rad_og) * np.cos(lon_rad)
            y = layer_a * np.cos(lat_rad_og) * np.sin(lon_rad)
            z = layer_b * np.sin(lat_rad_og)
            
            # Align with Texture (Top-Down)
            x = np.flipud(x)
            y = np.flipud(y)
            z = np.flipud(z)
            
            x = x.swapaxes(0, 1)
            y = y.swapaxes(0, 1)
            z = z.swapaxes(0, 1)
            
            grid = pv.StructuredGrid(x, y, z)
            
            u_coords = (lon_grid - min_lon) / (max_lon - min_lon)
            v_coords = (lat_grid - min_lat) / (max_lat - min_lat)
            
            # Flip UVs to match grid flip
            v_coords = np.flipud(v_coords)
            
            u_coords = u_coords.swapaxes(0, 1)
            v_coords = v_coords.swapaxes(0, 1)
            
            tex_coords = np.column_stack((u_coords.flatten(order='F'), v_coords.flatten(order='F')))
            grid.active_texture_coordinates = tex_coords
            mesh_to_add = grid

        else:
            # Global Sphere (Scaled)
            layer_sphere = pv.Sphere(radius=1.0, theta_resolution=self.sphere_res_theta, phi_resolution=self.sphere_res_phi)
            layer_sphere.points *= np.array([layer_a, layer_a, layer_b])
            
            # === FORCE UVs ===
            self.generate_spherical_uvs(layer_sphere)
            mesh_to_add = layer_sphere

        opacity = self.layer_controls[name]['slider'].value() / 100.0
        
        actor = self.plotter.add_mesh(
            mesh_to_add, texture=self.layer_textures[name], 
            opacity=opacity, smooth_shading=True, pickable=False 
        )
        self.layer_actors[name] = actor

    def remove_layer_actor(self, name):
        if name in self.layer_actors:
            self.plotter.remove_actor(self.layer_actors[name])
            del self.layer_actors[name]
            
    # === MANUAL LAYER ADDITION ===
    def manual_add_layer(self):
        filename, _ = QFileDialog.getOpenFileName(self, "Add External Layer", "", "GeoTIFF Files (*.tif *.tiff);;All Files (*)")
        if filename:
            name = os.path.splitext(os.path.basename(filename))[0]
            if name in LAYER_PATHS: name = name + "_Copy"
            self.on_analysis_complete(filename, name)

    # === REGIONAL ANALYSIS LOGIC ===
    def activate_draw_mode(self):
        self.clear_roi() 
        self.draw_mode_active = True
        self.is_dragging_roi = False
        self.plotter.setCursor(Qt.CursorShape.CrossCursor)
        self.chat_out.append("<i><b>Mode:</b> Draw Region. Click and Drag a box on Mars.</i>")
        
    def clear_roi(self):
        if self.roi_actor:
            self.plotter.remove_actor(self.roi_actor)
            self.roi_actor = None
            self.roi_bounds = None
            self.chat_out.append("<i>ROI Cleared.</i>")
            self.plotter.render()

    def update_roi_visuals(self, start_pos, end_pos):
        picker = vtk.vtkPropPicker()
        picker.Pick(start_pos.x(), start_pos.y(), 0, self.plotter.renderer)
        pos1 = picker.GetPickPosition()
        picker.Pick(end_pos.x(), end_pos.y(), 0, self.plotter.renderer)
        pos2 = picker.GetPickPosition()
        
        if np.linalg.norm(pos1) == 0 or np.linalg.norm(pos2) == 0: return

        def get_lat_lon(p):
            r = np.linalg.norm(p)
            lat = np.degrees(np.arcsin(p[2] / r))
            lon = np.degrees(np.arctan2(p[1], p[0]))
            return lat, lon

        lat1, lon1 = get_lat_lon(pos1)
        lat2, lon2 = get_lat_lon(pos2)
        min_lat, max_lat = min(lat1, lat2), max(lat1, lat2)
        min_lon, max_lon = min(lon1, lon2), max(lon1, lon2)

        if not self.is_dragging_roi:
            self.roi_bounds = (min_lat, max_lat, min_lon, max_lon)
            self.chat_out.append(f"<b>ROI Selected:</b> Lat {min_lat:.1f} to {max_lat:.1f}, Lon {min_lon:.1f} to {max_lon:.1f}")

        # Draw ROI Box (Approximate on Ellipsoid)
        r = MARS_A + 100.0
        lines = []
        for l in np.linspace(min_lon, max_lon, 20): lines.append([l, max_lat])
        for l in np.linspace(max_lat, min_lat, 20): lines.append([max_lon, l])
        for l in np.linspace(max_lon, min_lon, 20): lines.append([l, min_lat])
        for l in np.linspace(min_lat, max_lat, 20): lines.append([min_lon, l])
            
        points = []
        for lon, lat in lines:
            lat_rad, lon_rad = np.radians(lat), np.radians(lon)
            x = r * np.cos(lat_rad) * np.cos(lon_rad)
            y = r * np.cos(lat_rad) * np.sin(lon_rad)
            z = r * np.sin(lat_rad)
            points.append([x, y, z])
            
        roi_poly = pv.lines_from_points(points)
        if self.roi_actor: self.plotter.remove_actor(self.roi_actor)
        self.roi_actor = self.plotter.add_mesh(roi_poly, color="red", line_width=4, render_lines_as_tubes=True)

    def trigger_analysis(self, analysis_name, mode_code):
        if not self.roi_bounds:
            QMessageBox.warning(self, "No Region Selected", "Please draw a Region of Interest (Box) first.")
            return

        available_layers = list(LAYER_PATHS.keys())
        layer_name, ok = QInputDialog.getItem(self, f"Configure {analysis_name}", 
                                        "Select Input Dataset:", available_layers, 0, False)
        
        if ok and layer_name:
            input_path = LAYER_PATHS[layer_name]
            base_dir = os.path.dirname(input_path)
            safe_name = layer_name.replace(" ", "_").replace("(", "").replace(")", "")
            output_filename = f"{safe_name}_{mode_code}.tif"
            output_path = os.path.join(base_dir, output_filename)
            
            self.chat_out.append(f"<br><b>Running Physics Engine:</b> {analysis_name}")
            
            min_lat, max_lat, min_lon, max_lon = self.roi_bounds

            def run_physics():
                try:
                    script_dir = os.path.dirname(os.path.abspath(__file__))
                    engine_path = os.path.join(script_dir, "calc_physics.py")
                    
                    if not os.path.exists(engine_path): return

                    cmd = [
                        sys.executable, engine_path,
                        "--input", input_path,
                        "--output", output_path,
                        "--bounds", str(min_lon), str(min_lat), str(max_lon), str(max_lat),
                        "--mode", mode_code
                    ]
                    
                    result = subprocess.run(cmd, capture_output=True, text=True)
                    if result.returncode == 0:
                        QTimer.singleShot(0, lambda: self.on_analysis_complete(output_path, f"{layer_name} ({mode_code})"))
                        
                except Exception as e: print(e)
            
            threading.Thread(target=run_physics, daemon=True).start()

    def on_analysis_complete(self, filepath, display_name):
        self.chat_out.append(f"<b>Success!</b> New layer added: {display_name}")
        LAYER_PATHS[display_name] = filepath
        self.create_layer_control(display_name, self.dynamic_layer_group_layout)
        self.layer_controls[display_name]['chk'].setChecked(True)
        self.layer_controls[display_name]['slider'].setValue(80) 

    def export_chat_report(self):
        filename, _ = QFileDialog.getSaveFileName(self, "Save AI Report", "Mars_Mission_Log.txt", "Text Files (*.txt);;HTML Files (*.html)")
        if filename:
            with open(filename, 'w', encoding='utf-8') as f:
                if filename.endswith('.html'): f.write(self.chat_out.toHtml())
                else: f.write(self.chat_out.toPlainText())

    def save_screenshot(self):
        filename, _ = QFileDialog.getSaveFileName(self, "Save Screenshot", "Mars_View.png", "PNG Images (*.png)")
        if filename: self.plotter.screenshot(filename)
            
    def toggle_hud(self):
        if self.coord_label.isVisible(): self.coord_label.hide()
        else: self.coord_label.show()
        
    def reset_camera(self):
        self.plotter.camera_position = [(12000, 0, 0), (0, 0, 0), (0, 0, 1)]

    def eventFilter(self, obj, event):
        if obj == self.plotter:
            if self.draw_mode_active:
                if event.type() == QEvent.MouseButtonPress and event.button() == Qt.MouseButton.LeftButton:
                    self.draw_start_pos = event.pos()
                    self.is_dragging_roi = True
                    return True 
                
                if event.type() == QEvent.MouseMove and self.is_dragging_roi:
                    self.update_roi_visuals(self.draw_start_pos, event.pos())
                    return True 
                
                if event.type() == QEvent.MouseButtonRelease and event.button() == Qt.MouseButton.LeftButton:
                    if self.is_dragging_roi:
                        end_pos = event.pos()
                        self.is_dragging_roi = False
                        self.draw_mode_active = False 
                        self.update_roi_visuals(self.draw_start_pos, end_pos) 
                        self.plotter.setCursor(Qt.CursorShape.ArrowCursor)
                        self.draw_start_pos = None
                    return True

            if event.type() == QEvent.MouseMove:
                self.update_hud_from_mouse(event.pos())

        if event.type() == QEvent.KeyPress:
            if obj == self.chat_in:
                if event.key() == Qt.Key_Return:
                    self.handle_input()
                    return True
                return super().eventFilter(obj, event)

            if event.key() == Qt.Key_Space:
                if not self.chat_in.hasFocus():
                    self.trigger_ai_investigation()
                    return True
        
        return super().eventFilter(obj, event)

    def update_hud_from_mouse(self, qpoint):
        now = time.time()
        if now - self.last_hud_update < 0.03: return
        self.last_hud_update = now

        try:
            x, y = qpoint.x(), qpoint.y()
            picker = vtk.vtkPropPicker()
            picker.Pick(x, y, 0, self.plotter.renderer)
            pos = picker.GetPickPosition()
            
            if pos and np.linalg.norm(pos) > 0:
                r = np.linalg.norm(pos)
                lat = np.degrees(np.arcsin(pos[2] / r))
                lon = np.degrees(np.arctan2(pos[1], pos[0]))
                self.current_lat = lat
                self.current_lon = lon
                self.coord_label.setText(f"LAT: {lat:.2f} | LON: {lon:.2f}")
                self.coord_label.setStyleSheet("color: lime; font-weight: bold; background-color: rgba(0,0,0,150);")
            else:
                self.current_lat = None
                self.coord_label.setText("SCANNING VOID...")
                self.coord_label.setStyleSheet("color: red; font-weight: bold; background-color: rgba(0,0,0,150);")
        except: pass

    def trigger_ai_investigation(self):
        if self.current_lat is not None and self.current_lon is not None:
            nearby_feature = self.find_nearest_feature(self.current_lat, self.current_lon)
            if nearby_feature:
                self.chat_out.append(f"<br><i>Analyzing: {nearby_feature} (Lat {self.current_lat:.1f}, Lon {self.current_lon:.1f})...</i>")
                self.send_to_ai_thread(self.current_lat, self.current_lon, context_feature=nearby_feature)
            else:
                self.chat_out.append(f"<br><i>Analyzing: Lat {self.current_lat:.1f}, Lon {self.current_lon:.1f}...</i>")
                self.send_to_ai_thread(self.current_lat, self.current_lon)
        else:
            self.chat_out.append("<br><i>No target lock. Point at planet surface.</i>")

    def find_nearest_feature(self, lat, lon):
        min_dist = 99999
        nearest_name = None
        for name, coords in GEO_DATABASE.items():
            d_lat = coords['lat'] - lat
            d_lon = coords['lon'] - lon
            if d_lon > 180: d_lon -= 360
            if d_lon < -180: d_lon += 360
            dist = math.sqrt(d_lat**2 + d_lon**2)
            if dist < 15 and dist < min_dist:
                min_dist = dist
                nearest_name = name
        return nearest_name

    def send_to_ai_thread(self, lat, lon, context_feature=None):
        if context_feature:
            prompt = (
                f"The user is pointing at {context_feature} (Lat {lat:.1f}, Lon {lon:.1f}) on Mars. "
                f"Describe {context_feature} briefly. Mention its size or significance. "
                "Keep the answer concise (2-3 sentences)."
            )
        else:
            prompt = (
                f"I am pointing at Latitude {lat:.1f}, Longitude {lon:.1f} on Mars. "
                "Identify the general region (e.g. Northern Lowlands, Southern Highlands) or geological feature. "
                "Keep the answer concise (2-3 sentences)."
            )
        messages = [{"role": "system", "content": "You are a Mars expert database."}, {"role": "user", "content": prompt}]
        QApplication.setOverrideCursor(Qt.CursorShape.WaitCursor)
        self.ai_worker = AIWorker(messages, model="llama3.2")
        self.ai_worker.response_ready.connect(self.on_ai_response)
        self.ai_worker.error_occurred.connect(self.on_ai_error)
        self.ai_worker.finished.connect(self.on_ai_finished)
        self.ai_worker.start()

    def handle_input(self):
        text = self.chat_in.toPlainText().strip()
        self.chat_in.clear()
        if not text: return
        self.chat_out.append(f"<br><b>You:</b> {text}")
        self.plotter.setFocus() 
        current_request_msg = [self.system_prompt, {"role": "user", "content": text}]
        self.is_tour_active = False
        self.tour_queue = []
        QApplication.setOverrideCursor(Qt.CursorShape.WaitCursor)
        self.chat_out.append("<i>AI Processing...</i>")
        self.ai_worker = AIWorker(current_request_msg, model="llama3.2")
        self.ai_worker.response_ready.connect(self.process_ai_json)
        self.ai_worker.error_occurred.connect(self.on_ai_error)
        self.ai_worker.finished.connect(self.on_ai_finished)
        self.ai_worker.start()

    def on_ai_response(self, text):
        self.chat_out.append(f"<b>Analysis:</b> {text}")
        self.speak(text)

    def process_ai_json(self, text):
        clean_text = text.replace("```json", "").replace("```", "")
        try:
            start = clean_text.find('{')
            end = clean_text.rfind('}') + 1
            if start != -1 and end != -1:
                clean_json = clean_text[start:end]
                data = json.loads(clean_json)
                if data.get('type') == 'location':
                    self.chat_out.append(f"<b>AI:</b> Traveling to {data['name']}...")
                    self.speak(data['desc'])
                    self.smart_move(data['name'], data['lat'], data['lon'])
                elif data.get('type') == 'tour':
                    self.tour_queue = data['sites']
                    self.chat_out.append("<b>AI:</b> Starting Tour...")
                    self.is_tour_active = True
                    self.process_tour_step()
                elif data.get('type') == 'knowledge':
                    content = data.get('content', '')
                    self.chat_out.append(f"<b>AI:</b> {content}")
                    self.speak(content)
                else:
                    self.chat_out.append(f"<b>AI:</b> {text}")
                    self.speak(text)
            else:
                self.chat_out.append(f"<b>AI:</b> {text}")
                self.speak(text)
        except:
            self.chat_out.append(f"<b>AI (Raw):</b> {text}")
            self.speak(text)

    def on_ai_error(self, err_msg):
        self.chat_out.append(f"<i>AI Error: {err_msg}</i>")

    def on_ai_finished(self):
        QApplication.restoreOverrideCursor()

    def speak(self, text):
        self.voice_speaking = True
        self.worker = VoiceWorker(text)
        self.worker.finished_speaking.connect(self.on_voice_finished)
        self.worker.start()

    def on_voice_finished(self):
        self.voice_speaking = False
        self.check_tour_progress()

    def process_tour_step(self):
        if not self.tour_queue:
            self.chat_out.append("<b>AI:</b> Tour complete.")
            self.is_tour_active = False
            return
        site = self.tour_queue.pop(0)
        self.chat_out.append(f"<br><b>Tour Site:</b> {site['name']}")
        self.speak(site['desc'])
        self.smart_move(site['name'], site['lat'], site['lon'])

    def check_tour_progress(self):
        if self.is_tour_active and not self.camera_moving and not self.voice_speaking:
            QTimer.singleShot(2000, self.process_tour_step)

    def smart_move(self, name, lat, lon):
        clean_name = name.lower()
        target_lat = lat
        target_lon = lon
        for key, coords in GEO_DATABASE.items():
            if key.lower() in clean_name:
                target_lat = coords['lat']
                target_lon = coords['lon']
                break
        self.move_to(target_lat, target_lon)

    def move_to(self, target_lat, target_lon):
        self.plotter.camera.up = (0, 0, 1)
        pos = np.array(self.plotter.camera.position)
        dist = np.linalg.norm(pos)
        curr_lat = np.degrees(np.arcsin(pos[2] / dist))
        curr_lon = np.degrees(np.arctan2(pos[1], pos[0]))
        self.anim_start_lat = curr_lat
        self.anim_start_lon = curr_lon
        self.anim_end_lat = target_lat
        self.anim_end_lon = target_lon
        diff = self.anim_end_lon - self.anim_start_lon
        if diff > 180: self.anim_end_lon -= 360
        elif diff < -180: self.anim_end_lon += 360
        self.anim_step = 0
        self.anim_total_steps = 100 
        self.camera_moving = True
        self.anim_timer.start(20) 

    def update_animation(self):
        if self.anim_step > self.anim_total_steps:
            self.anim_timer.stop()
            self.camera_moving = False
            self.check_tour_progress()
            return
        t = self.anim_step / self.anim_total_steps
        t_smooth = t 
        lat = self.anim_start_lat + (self.anim_end_lat - self.anim_start_lat) * t_smooth
        lon = self.anim_start_lon + (self.anim_end_lon - self.anim_start_lon) * t_smooth
        lat_rad = np.radians(lat)
        lon_rad = np.radians(lon)
        r = np.linalg.norm(self.plotter.camera.position)
        x = r * np.cos(lat_rad) * np.cos(lon_rad)
        y = r * np.cos(lat_rad) * np.sin(lon_rad)
        z = r * np.sin(lat_rad)
        self.plotter.camera_position = [(x, y, z), (0, 0, 0), (0, 0, 1)]
        self.anim_step += 1

if __name__ == "__main__":
    if hasattr(Qt, 'AA_EnableHighDpiScaling'):
        QApplication.setAttribute(Qt.AA_EnableHighDpiScaling, True)
    if hasattr(Qt, 'AA_UseHighDpiPixmaps'):
        QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps, True)
    if hasattr(Qt, 'HighDpiScaleFactorRoundingPolicy'):
        os.environ["QT_AUTO_SCREEN_SCALE_FACTOR"] = "1"
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())