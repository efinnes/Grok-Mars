# juno_editor3.6.py - The Avatar Pose Architect v6.0
# Updated: Added OBJ File Support
# - Import .obj meshes via File Menu
# - New "IMPORTED MESH" sidebar section
# - Controls for Position, Rotation, and Scale of imported objects

import sys
import os
import base64
import json
import time
import re

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QFileDialog, QMessageBox
)
from PyQt6.QtGui import QAction
from PyQt6.QtCore import Qt
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebEngineCore import QWebEngineSettings

# === CONFIGURATION ===
# Paths provided by user
JUNO_APP_PATH = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\juno1.7.py"
DEFAULT_AVATAR_PATH = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Avatar\Juno1.vrm"
POSES_DIR = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Avatar\Positions"
VRMAS_DIR = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Avatar\VRMAS"
SPRITES_DIR = r"C:\Users\efinn\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Python 3.14\Mars Data\Avatar\Sprites"

# Ensure directories exist
os.makedirs(POSES_DIR, exist_ok=True)
os.makedirs(VRMAS_DIR, exist_ok=True)
os.makedirs(SPRITES_DIR, exist_ok=True)

class EditorDisplay(QWebEngineView):
    def __init__(self, default_path):
        super().__init__()
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.LocalContentCanAccessRemoteUrls, True)
        self.settings().setAttribute(QWebEngineSettings.WebAttribute.WebGLEnabled, True)
        self.setStyleSheet("background: #000;")
        self.page().setBackgroundColor(Qt.GlobalColor.black)
        self.setHtml(self.get_html_template())
        
        self.loadFinished.connect(lambda: self.inject_avatar_from_path(default_path))

    def inject_avatar_from_path(self, path):
        if not os.path.exists(path): return
        with open(path, "rb") as f: binary_data = f.read()
        self.inject_avatar_bytes(binary_data)

    def inject_avatar_bytes(self, data):
        b64 = base64.b64encode(data).decode('utf-8')
        self.page().runJavaScript(f"loadVRMFromBase64('{b64}');")

    # --- NEW: OBJ INJECTION ---
    def inject_obj_file(self, path):
        if not os.path.exists(path): return
        # OBJ is text-based, so we read as string, escape newlines, and pass to JS
        try:
            with open(path, "r", encoding='utf-8') as f:
                obj_text = f.read()
            # Sanitize for JS string
            clean_text = obj_text.replace('\\', '\\\\').replace('`', '\\`').replace('$', '\\$')
            # Using base64 to avoid string escaping hell with large geometry files
            b64_obj = base64.b64encode(clean_text.encode('utf-8')).decode('utf-8')
            self.page().runJavaScript(f"loadOBJFromBase64('{b64_obj}');")
        except Exception as e:
            print(f"OBJ Read Error: {e}")

    def toggle_timeline(self): self.page().runJavaScript("toggleTimelineUI(true);")
    def get_animation_data(self, callback): self.page().runJavaScript("exportAnimationData();", callback)
    def load_animation_json(self, json_str):
        clean_json = json_str.replace("'", "\\'").replace('\n', ' ')
        self.page().runJavaScript(f"importAnimationData('{clean_json}');")
    def get_current_pose(self, callback): self.page().runJavaScript("getCurrentPoseJSON();", callback)
    def apply_pose_json(self, json_str):
        clean_json = json_str.replace("'", "\\'").replace('"', '\\"').replace('\n', '')
        self.page().runJavaScript(f"applyPoseFromJSON('{clean_json}');")
    def generate_sprite_sheet(self, callback): self.page().runJavaScript("generateSpriteSheet(8);", callback)

    def get_html_template(self):
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style> 
                body { margin: 0; overflow: hidden; background-color: #000000; font-family: 'Segoe UI', monospace; color: #0f0; display: flex; height: 100vh; user-select: none; }
                #viewport { flex: 1; background: #111; position: relative; display: flex; flex-direction: column; }
                #render-area { flex: 1; position: relative; background-image: linear-gradient(45deg, #111 25%, transparent 25%), linear-gradient(-45deg, #111 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #111 75%), linear-gradient(-45deg, transparent 75%, #111 75%); background-size: 20px 20px; background-color: #080808; }
                #sidebar { width: 380px; background: #1a1a1a; border-left: 2px solid #005500; padding: 10px; overflow-y: auto; box-sizing: border-box; color: #eee; font-size: 11px; display: flex; flex-direction: column; }
                #category-select { width: 100%; padding: 8px; background: #003300; color: #0f0; border: 1px solid #0f0; margin-bottom: 15px; font-family: monospace; font-weight: bold; cursor: pointer; }
                h3 { border-bottom: 1px solid #444; padding-bottom: 2px; margin-top: 15px; margin-bottom: 5px; color: #0f0; text-transform: uppercase; font-size: 13px; }
                .control-group { margin-bottom: 2px; display: flex; align-items: center; }
                label { width: 15px; font-weight: bold; color: #666; }
                input[type=range] { flex: 1; margin: 0 5px; cursor: pointer; }
                .val-display { width: 35px; text-align: right; color: #fff; font-family: monospace;}
                .calibration-group { border: 1px dashed #555; padding: 5px; margin-bottom: 10px; background: #111; }
                .category-section { display: none; }
                .category-section.active { display: block; }
                #copy-section { margin-top: auto; background: #1a1a1a; border-top: 2px solid #005500; padding-top: 10px; }
                #copy-box { width: 100%; height: 60px; background: #000; color: #0f0; border: 1px solid #333; font-family: monospace; font-size: 10px; box-sizing: border-box; }
                #overlay-help { position: absolute; top: 10px; left: 10px; color: #666; font-size: 10px; pointer-events: none; }
                /* TIMELINE UI */
                #timeline-panel { height: 90px; background: #222; border-top: 2px solid #005500; display: none; flex-direction: column; padding: 10px; box-sizing: border-box; }
                .timeline-controls { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
                button.t-btn { background: #004400; border: 1px solid #0f0; color: #0f0; padding: 4px 10px; cursor: pointer; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                button.t-btn:hover { background: #006600; }
                button.t-btn:active { background: #0f0; color: #000; }
                button.t-btn.record { border-color: #f55; color: #f55; }
                button.t-btn.record:hover { background: #400; }
                button.t-btn:disabled { border-color: #444; color: #444; cursor: default; background: #222; }
                #time-display { font-family: monospace; font-size: 12px; min-width: 60px; text-align: right; }
                .timeline-track-container { position: relative; width: 100%; height: 30px; display: flex; align-items: center; }
                #time-scrubber { position: absolute; width: 100%; margin: 0; z-index: 10; opacity: 0.7; cursor: pointer; }
                #keyframe-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20; }
                .k-tick { position: absolute; width: 10px; height: 16px; background: #ffff00; top: 7px; transform: translateX(-5px); cursor: pointer; pointer-events: auto; border: 1px solid #000; box-shadow: 0 0 2px #000; }
                .k-tick:hover { background: #fff; transform: translateX(-5px) scale(1.1); }
                .k-tick.selected { background: #ff0000; border-color: #fff; z-index: 30; }
            </style>
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
            <div id="viewport">
                <div id="render-area">
                    <div id="overlay-help">TIMELINE: Click marker to Select -> Delete | Drag to Move</div>
                </div>
                <div id="timeline-panel">
                    <div class="timeline-controls">
                        <button class="t-btn" id="btn-play">▶ Play</button>
                        <button class="t-btn" id="btn-stop">■ Stop</button>
                        <span id="time-display">0.00s</span>
                        <div style="flex:1"></div> <button class="t-btn record" id="btn-keyframe">+ Keyframe</button>
                        <button class="t-btn" id="btn-delete-key" disabled>🗑️ Delete Key</button>
                        <button class="t-btn" id="btn-clear">Clear All</button>
                    </div>
                    <div class="timeline-track-container">
                        <input type="range" id="time-scrubber" min="0" max="500" value="0" step="1">
                        <div id="keyframe-overlay"></div>
                    </div>
                </div>
            </div>

            <div id="sidebar">
                <div style="text-align:center; color:#fff; font-weight:bold; padding:5px; margin-bottom:5px;">:: POSE ARCHITECT v6.0 ::</div>
                
                <select id="category-select">
                    <option value="sec-body">GLOBAL & TORSO</option>
                    <option value="sec-l-arm">LEFT ARM</option>
                    <option value="sec-r-arm">RIGHT ARM</option>
                    <option value="sec-l-hand">LEFT HAND (FINGERS)</option>
                    <option value="sec-r-hand">RIGHT HAND (FINGERS)</option>
                    <option value="sec-legs">LEGS</option>
                    <option value="sec-obj" style="color:#00ffff; font-weight:bold;">★ IMPORTED MESH (OBJ)</option>
                    <option value="sec-library" style="color:#ffff00;">★ POSE LIBRARY</option>
                </select>

                <div id="sec-body" class="category-section active">
                    <div class="calibration-group">
                        <div style="color:#f88; font-weight:bold; font-size:10px; margin-bottom:2px;">⚠️ CALIBRATION (TILT FIX)</div>
                        <div class="control-group"><label style="color:#f88">Z</label><input type="range" min="-0.2" max="0.2" step="0.001" value="0" id="sceneTilt"><span class="val-display" id="v_sceneTilt" style="color:#f88">0</span></div>
                    </div>
                    <h3>Global & Torso</h3>
                    <div id="controls-body"></div>
                </div>
                <div id="sec-l-arm" class="category-section"><div id="controls-l-arm"></div></div>
                <div id="sec-r-arm" class="category-section"><div id="controls-r-arm"></div></div>
                <div id="sec-l-hand" class="category-section"><div id="controls-l-hand"></div></div>
                <div id="sec-r-hand" class="category-section"><div id="controls-r-hand"></div></div>
                <div id="sec-legs" class="category-section"><div id="controls-legs"></div></div>

                <div id="sec-obj" class="category-section">
                    <h3>Object Transforms</h3>
                    <div style="font-size:10px; color:#aaa; margin-bottom:10px;">Move, Rotate, and Scale imported .OBJ meshes.</div>
                    <div class="calibration-group">
                        <div style="color:#0ff; font-size:10px; margin-bottom:5px;">POSITION</div>
                        <div class="control-group"><label>X</label><input type="range" min="-5" max="5" step="0.01" value="0" id="objPosX"><span class="val-display" id="v_objPosX">0</span></div>
                        <div class="control-group"><label>Y</label><input type="range" min="-5" max="5" step="0.01" value="0" id="objPosY"><span class="val-display" id="v_objPosY">0</span></div>
                        <div class="control-group"><label>Z</label><input type="range" min="-5" max="5" step="0.01" value="0" id="objPosZ"><span class="val-display" id="v_objPosZ">0</span></div>
                    </div>
                    <div class="calibration-group">
                        <div style="color:#0ff; font-size:10px; margin-bottom:5px;">ROTATION</div>
                        <div class="control-group"><label>X</label><input type="range" min="-3.14" max="3.14" step="0.05" value="0" id="objRotX"><span class="val-display" id="v_objRotX">0</span></div>
                        <div class="control-group"><label>Y</label><input type="range" min="-3.14" max="3.14" step="0.05" value="0" id="objRotY"><span class="val-display" id="v_objRotY">0</span></div>
                        <div class="control-group"><label>Z</label><input type="range" min="-3.14" max="3.14" step="0.05" value="0" id="objRotZ"><span class="val-display" id="v_objRotZ">0</span></div>
                    </div>
                    <div class="calibration-group">
                        <div style="color:#0ff; font-size:10px; margin-bottom:5px;">SCALE</div>
                        <div class="control-group"><label>S</label><input type="range" min="0.1" max="5" step="0.01" value="1" id="objScale"><span class="val-display" id="v_objScale">1</span></div>
                    </div>
                </div>

                <div id="sec-library" class="category-section">
                    <h3>Pose Library</h3>
                    <div style="font-size:11px; color:#aaa; margin-bottom:10px;">1. <b>LOAD ANIMATION</b> via Menu.<br>2. <b>CLICK</b> yellow marker to select.<br>3. <b>DRAG</b> to move.<br>4. <b>DELETE KEY</b> to remove.</div>
                </div>

                <div id="copy-section">
                    <div style="font-size:10px; color:#aaa; margin-bottom:5px;">CURRENT POSE DATA:</div>
                    <textarea id="copy-box" readonly></textarea>
                </div>
            </div>

            <script type="module">
                import * as THREE from 'three';
                import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
                import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'; // NEW
                import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
                import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

                document.getElementById('category-select').addEventListener('change', (e) => {
                    document.querySelectorAll('.category-section').forEach(el => el.classList.remove('active'));
                    document.getElementById(e.target.value).classList.add('active');
                });

                function createSlider(id, label, min=-3.14, max=3.14) {
                    const div = document.createElement('div');
                    div.className = 'control-group';
                    div.innerHTML = `<label>${label}</label><input type="range" min="${min}" max="${max}" step="0.05" value="0" id="${id}"><span class="val-display" id="v_${id}">0</span>`;
                    return div;
                }
                function createBoneGroup(containerId, boneName, displayLabel) {
                    const container = document.getElementById(containerId);
                    if(!container.querySelector('.grp-title-'+boneName)) {
                        const title = document.createElement('div');
                        title.className = 'grp-title-'+boneName;
                        title.style.cssText = "margin-top:8px; color:#888; font-size:10px; font-weight:bold;";
                        title.innerText = displayLabel.toUpperCase();
                        container.appendChild(title);
                    }
                    ['X','Y','Z'].forEach(axis => container.appendChild(createSlider(`${boneName}${axis}`, axis)));
                }

                const boneDefs = [
                    ['controls-body', 'hips', 'Hips'], ['controls-body', 'spine', 'Spine'],
                    ['controls-body', 'chest', 'Chest'], ['controls-body', 'neck', 'Neck'], ['controls-body', 'head', 'Head'],
                    ['controls-l-arm', 'leftShoulder', 'L. Shoulder'], ['controls-l-arm', 'leftUpperArm', 'L. Upper Arm'], ['controls-l-arm', 'leftLowerArm', 'L. Lower Arm'], ['controls-l-arm', 'leftHand', 'L. Wrist'],
                    ['controls-r-arm', 'rightShoulder', 'R. Shoulder'], ['controls-r-arm', 'rightUpperArm', 'R. Upper Arm'], ['controls-r-arm', 'rightLowerArm', 'R. Lower Arm'], ['controls-r-arm', 'rightHand', 'R. Wrist'],
                    ['controls-legs', 'leftUpperLeg', 'L. Upper Leg'], ['controls-legs', 'leftLowerLeg', 'L. Lower Leg'], ['controls-legs', 'leftFoot', 'L. Foot'], ['controls-legs', 'leftToes', 'L. Toes'],
                    ['controls-legs', 'rightUpperLeg', 'R. Upper Leg'], ['controls-legs', 'rightLowerLeg', 'R. Lower Leg'], ['controls-legs', 'rightFoot', 'R. Foot'], ['controls-legs', 'rightToes', 'R. Toes'],
                ];
                boneDefs.forEach(def => createBoneGroup(def[0], def[1], def[2]));

                const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'];
                const jointNames = ['Proximal', 'Intermediate', 'Distal'];
                fingerNames.forEach(f => {
                    jointNames.forEach(j => {
                        createBoneGroup('controls-l-hand', `left${f}${j}`, `L. ${f} ${j}`);
                        createBoneGroup('controls-r-hand', `right${f}${j}`, `R. ${f} ${j}`);
                    });
                });

                const allSliderIds = [];
                document.querySelectorAll('input[type=range]').forEach(el => {
                    if(!['sceneTilt','time-scrubber','objPosX','objPosY','objPosZ','objRotX','objRotY','objRotZ','objScale'].includes(el.id)) allSliderIds.push(el.id);
                });

                // --- OBJ CONTROL LOGIC ---
                let currentObj = null;
                
                function updateObjTransform() {
                    if(!currentObj) return;
                    currentObj.position.set(
                        parseFloat(document.getElementById('objPosX').value),
                        parseFloat(document.getElementById('objPosY').value),
                        parseFloat(document.getElementById('objPosZ').value)
                    );
                    currentObj.rotation.set(
                        parseFloat(document.getElementById('objRotX').value),
                        parseFloat(document.getElementById('objRotY').value),
                        parseFloat(document.getElementById('objRotZ').value)
                    );
                    const s = parseFloat(document.getElementById('objScale').value);
                    currentObj.scale.set(s, s, s);
                }
                
                ['objPosX','objPosY','objPosZ','objRotX','objRotY','objRotZ','objScale'].forEach(id => {
                    document.getElementById(id).addEventListener('input', (e) => {
                        document.getElementById('v_'+id).innerText = e.target.value;
                        updateObjTransform();
                    });
                });

                window.loadOBJFromBase64 = function(b64) {
                    try {
                        const text = atob(b64);
                        const loader = new OBJLoader();
                        const obj = loader.parse(text);
                        
                        // Clear old obj if exists
                        if(currentObj) { scene.remove(currentObj); }
                        
                        scene.add(obj);
                        currentObj = obj;
                        
                        // Reset controls
                        document.getElementById('objPosX').value = 0; document.getElementById('v_objPosX').innerText = "0";
                        document.getElementById('objPosY').value = 0; document.getElementById('v_objPosY').innerText = "0";
                        document.getElementById('objPosZ').value = 0; document.getElementById('v_objPosZ').innerText = "0";
                        document.getElementById('objRotX').value = 0; document.getElementById('v_objRotX').innerText = "0";
                        document.getElementById('objRotY').value = 0; document.getElementById('v_objRotY').innerText = "0";
                        document.getElementById('objRotZ').value = 0; document.getElementById('v_objRotZ').innerText = "0";
                        document.getElementById('objScale').value = 1; document.getElementById('v_objScale').innerText = "1";
                        
                        // Switch to tab
                        document.getElementById('category-select').value = "sec-obj";
                        document.querySelectorAll('.category-section').forEach(el => el.classList.remove('active'));
                        document.getElementById('sec-obj').classList.add('active');
                        
                        console.log("OBJ Loaded");
                    } catch(e) { console.error(e); }
                }

                function getCurrentPoseDict() {
                    const pose = {};
                    const processed = new Set();
                    allSliderIds.forEach(id => {
                        const bone = id.slice(0, -1);
                        if(processed.has(bone)) return;
                        processed.add(bone);
                        const x = parseFloat(document.getElementById(bone+'X').value);
                        const y = parseFloat(document.getElementById(bone+'Y').value);
                        const z = parseFloat(document.getElementById(bone+'Z').value);
                        pose[bone] = [x, y, z];
                    });
                    return pose;
                }

                function applyPoseDict(pose) {
                    for (const [bone, rot] of Object.entries(pose)) {
                        const [x, y, z] = rot;
                        const elX = document.getElementById(bone+'X');
                        const elY = document.getElementById(bone+'Y');
                        const elZ = document.getElementById(bone+'Z');
                        if(elX) {
                            elX.value = x; elY.value = y; elZ.value = z;
                            document.getElementById('v_'+bone+'X').innerText = x;
                            document.getElementById('v_'+bone+'Y').innerText = y;
                            document.getElementById('v_'+bone+'Z').innerText = z;
                        }
                    }
                }
                
                function forceUpdateBonesFromSliders() {
                    if(!currentVrm) return;
                    const processedBones = new Set();
                    allSliderIds.forEach(id => {
                        const boneName = id.slice(0, -1);
                        if(processedBones.has(boneName)) return;
                        processedBones.add(boneName);
                        const boneNode = currentVrm.humanoid.getNormalizedBoneNode(boneName);
                        if(boneNode) {
                            const x = parseFloat(document.getElementById(boneName+'X').value);
                            const y = parseFloat(document.getElementById(boneName+'Y').value);
                            const z = parseFloat(document.getElementById(boneName+'Z').value);
                            boneNode.rotation.set(x, y, z);
                        }
                    });
                    currentVrm.scene.updateMatrixWorld(true);
                }

                window.getCurrentPoseJSON = function() {
                    return JSON.stringify(getCurrentPoseDict(), null, 2);
                };

                window.applyPoseFromJSON = function(jsonStr) {
                    try { const pose = JSON.parse(jsonStr); applyPoseDict(pose); forceUpdateBonesFromSliders(); } catch(e) { console.error("Failed to load pose", e); }
                };
                
                window.toggleTimelineUI = function(show) {
                    const p = document.getElementById('timeline-panel');
                    if(p) { p.style.display = show ? 'flex' : 'none'; if(show) setTimeout(() => resizeRenderer(), 50); }
                };

                window.generateSpriteSheet = function(frameCount) {
                    if(!currentVrm) return null;
                    const width = renderer.domElement.width;
                    const height = renderer.domElement.height;
                    const sheet = document.createElement('canvas');
                    sheet.width = width * frameCount;
                    sheet.height = height;
                    const ctx = sheet.getContext('2d');
                    const originalTime = parseFloat(scrubber.value) / 100.0;
                    const wasPlaying = isPlaying;
                    isPlaying = false;
                    for(let i=0; i<frameCount; i++) {
                        const t = (i / frameCount) * maxTime;
                        interpolatePoseAt(t);
                        forceUpdateBonesFromSliders();
                        renderer.render(scene, camera);
                        ctx.drawImage(renderer.domElement, i * width, 0);
                    }
                    interpolatePoseAt(originalTime);
                    isPlaying = wasPlaying;
                    return sheet.toDataURL('image/png');
                };

                // --- POSE SLIDER LISTENER ---
                function updateReadout() {
                    let jsonParts = [];
                    const processedBones = new Set();
                    allSliderIds.forEach(id => {
                        const bone = id.slice(0, -1);
                        if(processedBones.has(bone)) return;
                        processedBones.add(bone);
                        const x = document.getElementById(bone+'X').value;
                        const y = document.getElementById(bone+'Y').value;
                        const z = document.getElementById(bone+'Z').value;
                        document.getElementById('v_'+bone+'X').innerText = x;
                        document.getElementById('v_'+bone+'Y').innerText = y;
                        document.getElementById('v_'+bone+'Z').innerText = z;
                        jsonParts.push(`    "${bone}": [${x}, ${y}, ${z}]`);
                    });
                    document.getElementById('copy-box').value = "const START_POSE = {\\n" + jsonParts.join(",\\n") + "\\n};";
                }
                allSliderIds.forEach(id => document.getElementById(id).addEventListener('input', updateReadout));

                document.getElementById('sceneTilt').addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    document.getElementById('v_sceneTilt').innerText = val;
                    if(currentVrm) currentVrm.scene.rotation.z = val;
                });

                // --- ANIMATION SYSTEM ---
                let keyframes = []; 
                let isPlaying = false;
                let maxTime = 5.0;
                let draggingKeyframeIdx = -1;
                let selectedKeyframeIdx = -1; 

                const scrubber = document.getElementById('time-scrubber');
                const timeDisplay = document.getElementById('time-display');
                const overlay = document.getElementById('keyframe-overlay');
                const btnDelete = document.getElementById('btn-delete-key');
                
                document.getElementById('btn-keyframe').addEventListener('click', () => {
                    const t = parseFloat(scrubber.value) / 100.0;
                    const pose = getCurrentPoseDict();
                    keyframes = keyframes.filter(k => Math.abs(k.time - t) > 0.01);
                    keyframes.push({ time: t, pose: pose });
                    keyframes.sort((a,b) => a.time - b.time);
                    drawKeyframeMarkers();
                });

                document.getElementById('btn-clear').addEventListener('click', () => {
                    if(confirm("Clear all animation data?")) { keyframes = []; selectedKeyframeIdx = -1; drawKeyframeMarkers(); }
                });
                
                btnDelete.addEventListener('click', () => {
                    if(selectedKeyframeIdx !== -1) { keyframes.splice(selectedKeyframeIdx, 1); selectedKeyframeIdx = -1; drawKeyframeMarkers(); }
                });

                function drawKeyframeMarkers() {
                    overlay.innerHTML = '';
                    btnDelete.disabled = (selectedKeyframeIdx === -1);
                    keyframes.forEach((k, idx) => {
                        const tick = document.createElement('div');
                        tick.className = 'k-tick';
                        if(idx === selectedKeyframeIdx) tick.classList.add('selected');
                        const pct = (k.time / maxTime) * 100;
                        tick.style.left = pct + '%';
                        tick.addEventListener('mousedown', (e) => {
                            e.stopPropagation(); selectedKeyframeIdx = idx; draggingKeyframeIdx = idx;
                            scrubber.value = k.time * 100; timeDisplay.innerText = k.time.toFixed(2) + 's';
                            interpolatePoseAt(k.time); drawKeyframeMarkers();
                        });
                        overlay.appendChild(tick);
                    });
                }
                
                window.addEventListener('mousemove', (e) => {
                    if(draggingKeyframeIdx !== -1) {
                        const rect = overlay.getBoundingClientRect();
                        let x = e.clientX - rect.left;
                        if(x < 0) x = 0; if(x > rect.width) x = rect.width;
                        const pct = x / rect.width;
                        let newTime = Math.round((pct * maxTime) * 20) / 20; 
                        keyframes[draggingKeyframeIdx].time = newTime;
                        scrubber.value = newTime * 100; timeDisplay.innerText = newTime.toFixed(2) + 's';
                        drawKeyframeMarkers(); 
                    }
                });
                
                window.addEventListener('mouseup', () => {
                    if(draggingKeyframeIdx !== -1) { keyframes.sort((a,b) => a.time - b.time); selectedKeyframeIdx = -1; draggingKeyframeIdx = -1; drawKeyframeMarkers(); }
                });

                document.getElementById('btn-play').addEventListener('click', () => { isPlaying = true; });
                document.getElementById('btn-stop').addEventListener('click', () => { isPlaying = false; });

                scrubber.addEventListener('input', (e) => {
                    const t = parseFloat(e.target.value) / 100.0;
                    timeDisplay.innerText = t.toFixed(2) + 's';
                    interpolatePoseAt(t);
                });

                function interpolatePoseAt(time) {
                    if (keyframes.length === 0) return;
                    let prev = keyframes[0];
                    let next = keyframes[keyframes.length - 1];
                    for(let i=0; i<keyframes.length; i++) {
                        if(keyframes[i].time <= time) prev = keyframes[i];
                        if(keyframes[i].time >= time) { next = keyframes[i]; break; }
                    }
                    if (prev === next) { applyPoseDict(prev.pose); return; }
                    const duration = next.time - prev.time;
                    const alpha = (time - prev.time) / duration;
                    const lerpedPose = {};
                    for(const bone in prev.pose) {
                        const rotA = prev.pose[bone]; const rotB = next.pose[bone];
                        if(rotA && rotB) {
                            lerpedPose[bone] = [ rotA[0] + (rotB[0] - rotA[0]) * alpha, rotA[1] + (rotB[1] - rotA[1]) * alpha, rotA[2] + (rotB[2] - rotA[2]) * alpha ];
                        }
                    }
                    applyPoseDict(lerpedPose);
                }

                window.exportAnimationData = function() {
                    const exportObj = { "meta": { "version": "Juno-VRMA-v1", "duration": maxTime }, "keyframes": keyframes };
                    return JSON.stringify(exportObj, null, 2);
                };

                window.importAnimationData = function(jsonStr) {
                    try {
                        const data = JSON.parse(jsonStr);
                        if(data.keyframes && Array.isArray(data.keyframes)) {
                            keyframes = data.keyframes;
                            if(data.meta && data.meta.duration) maxTime = data.meta.duration;
                            keyframes.sort((a,b) => a.time - b.time);
                            toggleTimelineUI(true); drawKeyframeMarkers(); scrubber.value = 0; interpolatePoseAt(0); forceUpdateBonesFromSliders();
                            alert("Animation Loaded! " + keyframes.length + " frames.");
                        } else { alert("Invalid format: Missing keyframes array."); }
                    } catch(e) { console.error("Import failed:", e); alert("Import failed: " + e); }
                }

                // --- SCENE SETUP ---
                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
                function resizeRenderer() {
                    const area = document.getElementById('render-area');
                    if(!area) return;
                    renderer.setSize(area.clientWidth, area.clientHeight);
                    if(camera) camera.aspect = area.clientWidth / area.clientHeight;
                    if(camera) camera.updateProjectionMatrix();
                }
                document.getElementById('render-area').appendChild(renderer.domElement);

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(35.0, 1.0, 0.1, 20.0);
                const HOME_POS = { x: 0.0, y: 1.3, z: 2.5 };
                camera.position.set(HOME_POS.x, HOME_POS.y, HOME_POS.z);

                const controls = new OrbitControls(camera, renderer.domElement);
                controls.target.set(0.0, 1.0, 0.0);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                
                const gridHelper = new THREE.GridHelper(10, 20, 0x005500, 0x222222);
                gridHelper.rotation.x = Math.PI / 2;
                gridHelper.position.z = -0.5; gridHelper.position.y = 1.0; 
                scene.add(gridHelper);

                const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
                dirLight.position.set(1.0, 1.0, 1.0).normalize();
                scene.add(dirLight);
                scene.add(new THREE.AmbientLight(0x404040, 1.0));

                let currentVrm = null;
                const clock = new THREE.Clock();
                const loader = new GLTFLoader();
                loader.register((parser) => new VRMLoaderPlugin(parser));

                window.loadVRMFromBase64 = function(b64) {
                    const binaryString = window.atob(b64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
                    loader.parse(bytes.buffer, '', (gltf) => {
                        if (currentVrm) { scene.remove(currentVrm.scene); VRMUtils.deepDispose(currentVrm.scene); }
                        const vrm = gltf.userData.vrm;
                        VRMUtils.removeUnnecessaryVertices(gltf.scene);
                        VRMUtils.combineSkeletons(gltf.scene);
                        vrm.scene.rotation.y = 0;
                        vrm.scene.rotation.z = parseFloat(document.getElementById('sceneTilt').value);
                        scene.add(vrm.scene);
                        currentVrm = vrm;
                    }, (err) => console.error(err));
                }

                function animate() {
                    requestAnimationFrame(animate);
                    const delta = clock.getDelta();
                    controls.update();
                    if(isPlaying) {
                        let t = parseFloat(scrubber.value) + (delta * 100); 
                        if (t > 500) t = 0;
                        scrubber.value = t; timeDisplay.innerText = (t/100).toFixed(2) + 's';
                        interpolatePoseAt(t/100);
                    }
                    if (currentVrm) { currentVrm.update(delta); forceUpdateBonesFromSliders(); }
                    renderer.render(scene, camera);
                }
                animate();
                resizeRenderer();
                window.addEventListener('resize', resizeRenderer);
            </script>
        </body>
        </html>
        """

class JunoEditorApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Juno - Pose Editor & OBJ Architect")
        self.resize(1200, 850)
        self.setStyleSheet("background-color: #1a1a1a; color: #eee;")

        menubar = self.menuBar()
        menubar.setStyleSheet("background-color: #333; color: #fff;")
        
        file_menu = menubar.addMenu('File')
        import_action = QAction('Import VRM Avatar...', self)
        import_action.triggered.connect(self.import_vrm)
        file_menu.addAction(import_action)
        
        # --- NEW: IMPORT OBJ ---
        import_obj_action = QAction('Import OBJ Mesh...', self)
        import_obj_action.triggered.connect(self.import_obj)
        file_menu.addAction(import_obj_action)

        anim_menu = menubar.addMenu('Animation')
        create_vrma_action = QAction('Create VRMA Animation', self)
        create_vrma_action.triggered.connect(self.enable_animation_mode)
        anim_menu.addAction(create_vrma_action)
        load_anim_action = QAction('Load Animation File...', self)
        load_anim_action.triggered.connect(self.load_vrma_file)
        anim_menu.addAction(load_anim_action)
        save_vrma_action = QAction('Save VRMA File...', self)
        save_vrma_action.triggered.connect(self.save_vrma_file)
        anim_menu.addAction(save_vrma_action)

        pose_menu = menubar.addMenu('Poses')
        save_pose_action = QAction('Save Current Pose...', self)
        save_pose_action.triggered.connect(self.save_pose)
        pose_menu.addAction(save_pose_action)
        load_pose_action = QAction('Load Pose...', self)
        load_pose_action.triggered.connect(self.load_pose)
        pose_menu.addAction(load_pose_action)
        
        sprite_menu = menubar.addMenu('Sprites')
        export_sprite_action = QAction('Export Sprite Sheet (8-Frame Strip)', self)
        export_sprite_action.triggered.connect(self.export_sprite_sheet)
        sprite_menu.addAction(export_sprite_action)

        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)

        self.editor = EditorDisplay(DEFAULT_AVATAR_PATH)
        main_layout.addWidget(self.editor)

    def import_vrm(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Open VRM Avatar", "", "VRM Files (*.vrm);;All Files (*)")
        if file_name:
            try:
                with open(file_name, "rb") as f: self.editor.inject_avatar_bytes(f.read())
            except Exception as e: print(f"Error: {e}")

    # --- NEW: OBJ IMPORT HANDLER ---
    def import_obj(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Open OBJ Mesh", "", "OBJ Files (*.obj);;All Files (*)")
        if file_name:
            self.editor.inject_obj_file(file_name)

    def save_pose(self): self.editor.get_current_pose(self._handle_save_pose)
    def _handle_save_pose(self, data):
        if not data or data == 'null': return
        file_name, _ = QFileDialog.getSaveFileName(self, "Save Pose Preset", os.path.join(POSES_DIR, "NewPose.json"), "JSON Files (*.json)")
        if file_name:
            with open(file_name, "w", encoding='utf-8') as f: f.write(data) 
            QMessageBox.information(self, "Saved", f"Pose saved to: {file_name}")

    def load_pose(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Load Pose Preset", POSES_DIR, "JSON Files (*.json)")
        if file_name:
            with open(file_name, "r", encoding='utf-8') as f: self.editor.apply_pose_json(f.read())

    def enable_animation_mode(self): self.editor.toggle_timeline()
    def save_vrma_file(self): self.editor.get_animation_data(self._handle_save_vrma)
    def _handle_save_vrma(self, data):
        if not data or data == 'null': return
        file_name, _ = QFileDialog.getSaveFileName(self, "Save VRMA Animation", os.path.join(VRMAS_DIR, "MyAnimation.json"), "JSON Files (*.json);;VRMA Files (*.vrma)")
        if file_name:
            with open(file_name, "w", encoding='utf-8') as f: json.dump(json.loads(data), f, indent=2)
            QMessageBox.information(self, "Success", f"Animation saved to:\n{file_name}")

    def load_vrma_file(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Load Animation", VRMAS_DIR, "JSON Files (*.json);;VRMA Files (*.vrma);;All Files (*.*)")
        if file_name:
            with open(file_name, "r", encoding='utf-8') as f: self.editor.load_animation_json(f.read())

    def export_sprite_sheet(self): self.editor.generate_sprite_sheet(self._handle_sprite_sheet)
    def _handle_sprite_sheet(self, data_url):
        if not data_url or "," not in data_url: return
        header, b64 = data_url.split(',', 1)
        file_name, _ = QFileDialog.getSaveFileName(self, "Save Sprite Sheet", os.path.join(SPRITES_DIR, "MySpriteSheet.png"), "PNG Images (*.png)")
        if file_name:
            with open(file_name, "wb") as f: f.write(base64.b64decode(b64))
            QMessageBox.information(self, "Success", f"Sprite Sheet saved to:\n{file_name}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = JunoEditorApp()
    window.show()
    sys.exit(app.exec())