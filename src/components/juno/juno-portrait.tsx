import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";
import { useJuno } from "@/lib/juno/store";
import { RESTING } from "@/lib/juno/resting";

const FACE = new THREE.Vector3();
const CAM = new THREE.Vector3();
const EYE_L = new THREE.Vector3();
const EYE_R = new THREE.Vector3();
const HEAD = new THREE.Vector3();
const RIGHT = new THREE.Vector3();
const FRONT = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

// Close-up of the face, but far enough that the bun and hair stay inside the frame.
const FACE_DIST = 0.88;
const FACE_FOV = 28;

export function JunoPortrait() {
  return (
    <div className="relative h-full min-h-[14rem] w-full overflow-hidden bg-bg">
      <img
        src="/juno/studio.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-black/20" />
      <Canvas
        camera={{ position: [0, 1.55, 0.88], fov: FACE_FOV, near: 0.02, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[0.2, 1.7, 2.2]} intensity={2.1} color="#fff1dc" />
        <directionalLight position={[0.2, 1.7, -2.2]} intensity={2.1} color="#fff1dc" />
        <directionalLight position={[-1.2, 1.3, 0.4]} intensity={0.4} color="#8ab4ff" />
        <hemisphereLight args={["#f0c8a0", "#1a120e", 0.34]} />
        <Suspense fallback={null}>
          <JunoVrm />
        </Suspense>
      </Canvas>
    </div>
  );
}

function bone(vrm: VRM, name: "head" | "neck" | "jaw" | "leftEye" | "rightEye" | keyof typeof RESTING) {
  return vrm.humanoid?.getNormalizedBoneNode(name as "head") ?? null;
}

function applyRest(vrm: VRM) {
  for (const [name, rot] of Object.entries(RESTING)) {
    const node = bone(vrm, name as keyof typeof RESTING);
    if (node) node.rotation.set(rot[0], rot[1], rot[2]);
  }
  const neck = bone(vrm, "neck");
  const head = bone(vrm, "head");
  if (neck) neck.rotation.set(0, 0, 0);
  if (head) head.rotation.set(0, 0, 0);
}

function faceCenter(vrm: VRM, out: THREE.Vector3) {
  const left = vrm.humanoid?.getRawBoneNode("leftEye") ?? bone(vrm, "leftEye");
  const right = vrm.humanoid?.getRawBoneNode("rightEye") ?? bone(vrm, "rightEye");
  if (left && right) {
    left.getWorldPosition(EYE_L);
    right.getWorldPosition(EYE_R);
    out.lerpVectors(EYE_L, EYE_R, 0.5);
    return;
  }
  const rawHead = vrm.humanoid?.getRawBoneNode("head") ?? bone(vrm, "head");
  if (!rawHead) return;
  rawHead.getWorldPosition(HEAD);
  out.copy(HEAD);
  out.y += 0.1;
}

/** Unit vector out of the face (left-eye → right-eye × world up). */
function faceFront(vrm: VRM, out: THREE.Vector3) {
  const left = vrm.humanoid?.getRawBoneNode("leftEye") ?? bone(vrm, "leftEye");
  const right = vrm.humanoid?.getRawBoneNode("rightEye") ?? bone(vrm, "rightEye");
  if (left && right) {
    left.getWorldPosition(EYE_L);
    right.getWorldPosition(EYE_R);
    RIGHT.subVectors(EYE_R, EYE_L);
    if (RIGHT.lengthSq() > 1e-8) {
      RIGHT.normalize();
      // UP × right-eye-axis points out the face on this VRM (RIGHT × UP was the back of the head).
      out.crossVectors(UP, RIGHT).normalize();
      return;
    }
  }
  out.set(0, 0, 1);
}

function JunoVrm() {
  const group = useRef<THREE.Group>(null);
  const vrmRef = useRef<VRM | null>(null);
  const speaking = useJuno((s) => s.speaking);
  const ready = useRef(false);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    let dead = false;
    void loader.loadAsync("/juno/Juno.vrm").then((gltf) => {
      if (dead) return;
      const vrm = gltf.userData.vrm as VRM;
      VRMUtils.removeUnnecessaryVertices(gltf.scene);
      VRMUtils.combineSkeletons(gltf.scene);
      // This VRM already faces +Z. Math.PI put the camera on the back of her head.
      vrm.scene.rotation.y = 0;
      vrm.scene.traverse((o) => {
        o.frustumCulled = false;
      });
      if (vrm.lookAt) vrm.lookAt.autoUpdate = false;
      applyRest(vrm);
      vrmRef.current = vrm;
      group.current?.add(vrm.scene);
      ready.current = true;
    });
    return () => {
      dead = true;
      ready.current = false;
      if (vrmRef.current) {
        vrmRef.current.scene.removeFromParent();
        vrmRef.current = null;
      }
    };
  }, []);

  useFrame(({ camera }, dt) => {
    const vrm = vrmRef.current;
    if (!vrm || !ready.current) return;
    const t = performance.now() / 1000;
    const mouth = speaking ? 0.06 + Math.abs(Math.sin(t * 9.5)) * 0.1 : 0.012;
    applyRest(vrm);
    const jaw = bone(vrm, "jaw");
    if (jaw) jaw.rotation.x = mouth;
    vrm.update(dt);
    applyRest(vrm);
    if (jaw) jaw.rotation.x = mouth;
    vrm.humanoid?.update();
    vrm.scene.updateMatrixWorld(true);

    faceCenter(vrm, FACE);
    faceFront(vrm, FRONT);
    CAM.copy(FACE).addScaledVector(FRONT, FACE_DIST);
    camera.position.copy(CAM);
    camera.near = 0.02;
    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = FACE_FOV;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(FACE);
  });

  return <group ref={group} position={[0, 0, 0]} />;
}
