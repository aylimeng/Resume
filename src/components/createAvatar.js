import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const Y_AXIS = new THREE.Vector3(0, 1, 0)

function material(color, roughness = 0.72, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function sphere(parent, name, position, scale, mat, segments = 28) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, segments, Math.max(16, Math.floor(segments * 0.7))),
    mat,
  )
  mesh.name = name
  mesh.position.set(...position)
  mesh.scale.set(...scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function box(parent, name, position, size, mat, rotation = [0, 0, 0], bevel = 0) {
  const geometry = bevel
    ? new THREE.BoxGeometry(...size, 4, 4, 4)
    : new THREE.BoxGeometry(...size)
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function roundedBox(parent, name, position, size, mat, rotation = [0, 0, 0]) {
  const [width, height, depth] = size
  const geometry = new RoundedBoxGeometry(width, height, depth, 3, Math.min(0.035, depth * 0.45))
  const mesh = new THREE.Mesh(geometry, mat)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function segment(parent, name, start, end, radiusStart, radiusEnd, mat, radialSegments = 18) {
  const a = new THREE.Vector3(...start)
  const b = new THREE.Vector3(...end)
  const direction = b.clone().sub(a)
  const length = direction.length()
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusEnd, radiusStart, length, radialSegments, 1),
    mat,
  )
  mesh.name = name
  mesh.position.copy(a.add(b).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(Y_AXIS, direction.normalize())
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  sphere(parent, `${name}-joint-a`, start, [radiusStart, radiusStart, radiusStart], mat, 18)
  sphere(parent, `${name}-joint-b`, end, [radiusEnd, radiusEnd, radiusEnd], mat, 18)
  return mesh
}

function addSneaker(parent, x, z, mats) {
  const shoe = new THREE.Group()
  shoe.position.set(x, -1.58, z)
  shoe.rotation.y = x < 0 ? -0.08 : 0.08
  parent.add(shoe)

  sphere(shoe, 'sneaker sole', [0, 0, 0.12], [0.31, 0.12, 0.5], mats.sole)
  sphere(shoe, 'sneaker midsole', [0, 0.075, 0.12], [0.29, 0.1, 0.47], mats.midsole)
  sphere(shoe, 'sneaker upper', [0, 0.19, 0.04], [0.255, 0.19, 0.39], mats.shoe)
  sphere(shoe, 'sneaker toe', [0, 0.17, 0.31], [0.24, 0.16, 0.22], mats.shoeLight)
  box(shoe, 'tongue', [0, 0.31, -0.03], [0.16, 0.07, 0.25], mats.shoeLight, [-0.18, 0, 0])
  box(shoe, 'heel tab', [0, 0.26, -0.29], [0.19, 0.16, 0.055], mats.navy)

  for (let i = 0; i < 4; i += 1) {
    const laceZ = 0.18 - i * 0.075
    box(shoe, `lace-${i}`, [0, 0.34 - i * 0.023, laceZ], [0.19, 0.018, 0.025], mats.lace, [0, 0.04 * (i % 2 ? 1 : -1), 0])
  }
  box(shoe, 'side stripe', [x < 0 ? -0.21 : 0.21, 0.2, 0.0], [0.018, 0.12, 0.28], mats.blue, [0.18, 0, -0.16])
  return shoe
}

function addGlasses(parent, mats) {
  const group = new THREE.Group()
  group.name = 'sunglasses resting on hair'
  group.position.set(0, 4.08, 0.4)
  group.rotation.x = -0.12
  group.rotation.z = 0.025
  parent.add(group)

  const lensMat = new THREE.MeshStandardMaterial({
    color: '#222b35',
    roughness: 0.16,
    metalness: 0.18,
    transparent: true,
    opacity: 0.9,
  })

  for (const side of [-1, 1]) {
    const x = side * 0.23
    roundedBox(group, `lens-${side}`, [x, 0, 0], [0.3, 0.205, 0.035], lensMat, [0, 0, side * -0.04])
    roundedBox(group, `frame-top-${side}`, [x, 0.112, 0.02], [0.36, 0.04, 0.06], mats.frame, [0, 0, side * -0.04])
    roundedBox(group, `frame-bottom-${side}`, [x, -0.112, 0.02], [0.36, 0.035, 0.06], mats.frame, [0, 0, side * -0.04])
    roundedBox(group, `frame-outer-${side}`, [x + side * 0.175, 0, 0.02], [0.04, 0.22, 0.06], mats.frame)
    roundedBox(group, `frame-inner-${side}`, [x - side * 0.175, 0, 0.02], [0.04, 0.22, 0.06], mats.frame)
  }
  roundedBox(group, 'glasses bridge', [0, 0.005, 0.03], [0.13, 0.035, 0.06], mats.frame)
  roundedBox(group, 'glasses arm left', [-0.43, 0, -0.12], [0.34, 0.035, 0.035], mats.frame, [0, -0.35, 0])
  roundedBox(group, 'glasses arm right', [0.43, 0, -0.12], [0.34, 0.035, 0.035], mats.frame, [0, 0.35, 0])
}

function addCharacter(parent) {
  const mats = {
    skin: material('#f2b58f', 0.82),
    skinLight: material('#ffd0aa', 0.75),
    blush: new THREE.MeshStandardMaterial({ color: '#ef9b86', roughness: 0.9, transparent: true, opacity: 0.64 }),
    hair: material('#171b22', 0.72),
    hairLight: material('#252a32', 0.76),
    shirt: material('#17191e', 0.9),
    shirtShade: material('#262b34', 0.82),
    shorts: material('#c9b18d', 0.88),
    shortsLight: material('#dfc9a8', 0.82),
    backpack: material('#293e5c', 0.84),
    backpackLight: material('#3c5678', 0.78),
    sock: material('#5f6570', 0.92),
    shoe: material('#77828d', 0.74),
    shoeLight: material('#a4adb5', 0.7),
    sole: material('#343a42', 0.85),
    midsole: material('#e6e2d9', 0.78),
    lace: material('#d2d0c9', 0.7),
    blue: material('#4b81ba', 0.5, 0.1),
    navy: material('#202e43', 0.76),
    frame: material('#12151b', 0.24, 0.1),
    eyeWhite: material('#fff8ed', 0.4),
    iris: material('#4b3027', 0.32),
    pupil: material('#161316', 0.22),
    brow: material('#29211f', 0.82),
    mouth: material('#6a2d30', 0.66),
    teeth: material('#fff8ed', 0.35),
  }

  // All body parts live in a lightly lowered group so the model turns around its center.
  const body = new THREE.Group()
  body.position.y = -1.12
  parent.add(body)

  // Backpack first, so the shell sits naturally behind the torso.
  sphere(body, 'backpack body', [0, 1.78, -0.48], [0.82, 0.77, 0.3], mats.backpack)
  sphere(body, 'backpack top flap', [0, 2.4, -0.43], [0.7, 0.22, 0.28], mats.backpackLight)
  sphere(body, 'front backpack pocket', [0, 1.47, -0.18], [0.43, 0.27, 0.12], mats.navy)
  box(body, 'backpack buckle', [0, 1.42, -0.055], [0.12, 0.11, 0.035], mats.blue)

  // Neck and relaxed black tee.
  segment(body, 'neck', [0, 2.68, 0.02], [0, 3.02, 0.02], 0.19, 0.2, mats.skin, 24)
  sphere(body, 't-shirt torso', [0, 1.98, 0], [0.72, 0.83, 0.46], mats.shirt, 40)
  sphere(body, 't-shirt hem', [0, 1.35, 0.02], [0.69, 0.18, 0.44], mats.shirt, 32)
  sphere(body, 'left sleeve', [-0.67, 2.29, 0], [0.34, 0.3, 0.41], mats.shirt)
  sphere(body, 'right sleeve', [0.67, 2.29, 0], [0.34, 0.3, 0.41], mats.shirt)
  sphere(body, 'collar', [0, 2.72, 0.12], [0.31, 0.12, 0.35], mats.shirtShade)
  sphere(body, 'collar opening', [0, 2.76, 0.17], [0.22, 0.065, 0.27], mats.skin)

  // Blue backpack straps curve over the shirt front.
  for (const side of [-1, 1]) {
    const strap = sphere(body, `backpack strap ${side}`, [side * 0.47, 2.02, 0.355], [0.105, 0.69, 0.09], mats.backpackLight)
    strap.rotation.z = side * -0.11
    box(body, `strap adjuster ${side}`, [side * 0.51, 1.77, 0.43], [0.12, 0.18, 0.045], mats.navy, [0, 0, side * -0.1])
  }

  // Seated shorts and bent legs.
  sphere(body, 'shorts waist', [0, 1.11, 0.08], [0.65, 0.38, 0.43], mats.shorts)
  for (const side of [-1, 1]) {
    const hip = [side * 0.32, 1.02, 0.05]
    const knee = [side * 0.51, 0.37, 0.46]
    const ankle = [side * 0.54, -1.18, 0.48]

    segment(body, `short leg ${side}`, hip, knee, 0.28, 0.24, mats.shorts, 24)
    segment(body, `lower leg ${side}`, knee, ankle, 0.19, 0.15, mats.skin, 24)
    segment(body, `sock ${side}`, [side * 0.54, -1.01, 0.48], [side * 0.54, -1.32, 0.48], 0.16, 0.16, mats.sock, 20)
    addSneaker(body, side * 0.54, 0.48, mats)
  }

  // Arms extend outward and lift into the double thumbs-up pose.
  for (const side of [-1, 1]) {
    const shoulder = [side * 0.64, 2.4, 0.02]
    const elbow = [side * 1.13, 1.84, 0.13]
    const wrist = [side * 1.49, 2.16, 0.23]
    segment(body, `upper arm ${side}`, shoulder, elbow, 0.22, 0.18, mats.skin, 24)
    segment(body, `forearm ${side}`, elbow, wrist, 0.17, 0.135, mats.skin, 24)
    sphere(body, `thumb palm ${side}`, [side * 1.56, 2.24, 0.25], [0.18, 0.17, 0.14], mats.skin)
    segment(body, `thumb ${side}`, [side * 1.58, 2.3, 0.29], [side * 1.62, 2.58, 0.31], 0.075, 0.062, mats.skinLight, 16)
    for (let finger = 0; finger < 4; finger += 1) {
      const x = side * (1.47 + finger * 0.055)
      const y = 2.14 - Math.abs(1.5 - finger) * 0.035
      segment(body, `finger ${side}-${finger}`, [x, y, 0.31], [x + side * 0.04, y - 0.11, 0.34], 0.035, 0.028, mats.skin, 12)
    }
  }

  // Friendly face with ears, blush, glossy eyes, brows and a curved open smile.
  sphere(body, 'head', [0, 3.36, 0.04], [0.61, 0.71, 0.56], mats.skin, 48)
  sphere(body, 'left ear', [-0.59, 3.31, 0.01], [0.15, 0.23, 0.13], mats.skin)
  sphere(body, 'right ear', [0.59, 3.31, 0.01], [0.15, 0.23, 0.13], mats.skin)
  for (const side of [-1, 1]) {
    sphere(body, `cheek ${side}`, [side * 0.36, 3.16, 0.42], [0.17, 0.11, 0.055], mats.blush)
    sphere(body, `eye white ${side}`, [side * 0.22, 3.46, 0.505], [0.12, 0.145, 0.07], mats.eyeWhite)
    sphere(body, `iris ${side}`, [side * 0.22, 3.45, 0.567], [0.061, 0.078, 0.035], mats.iris)
    sphere(body, `pupil ${side}`, [side * 0.22, 3.45, 0.594], [0.032, 0.045, 0.02], mats.pupil)
    sphere(body, `eye glint ${side}`, [side * 0.22 - 0.018, 3.48, 0.61], [0.014, 0.018, 0.01], mats.eyeWhite, 14)
    const brow = sphere(body, `eyebrow ${side}`, [side * 0.22, 3.68, 0.57], [0.16, 0.047, 0.055], mats.brow)
    brow.rotation.z = side * -0.12
  }
  sphere(body, 'nose', [0, 3.27, 0.585], [0.115, 0.09, 0.075], mats.skinLight)

  const smileShape = new THREE.Shape()
  smileShape.moveTo(-0.22, 0.055)
  smileShape.quadraticCurveTo(0, -0.17, 0.22, 0.055)
  smileShape.quadraticCurveTo(0, -0.075, -0.22, 0.055)
  const smile = new THREE.Mesh(new THREE.ShapeGeometry(smileShape, 18), mats.mouth)
  smile.name = 'smile'
  smile.position.set(0, 3.11, 0.63)
  smile.castShadow = true
  body.add(smile)

  const toothShape = new THREE.Shape()
  toothShape.moveTo(-0.15, 0.02)
  toothShape.quadraticCurveTo(0, -0.04, 0.15, 0.02)
  toothShape.lineTo(0.12, -0.025)
  toothShape.quadraticCurveTo(0, -0.065, -0.12, -0.025)
  toothShape.closePath()
  const teeth = new THREE.Mesh(new THREE.ShapeGeometry(toothShape, 16), mats.teeth)
  teeth.name = 'smile teeth'
  teeth.position.set(0, 3.126, 0.65)
  body.add(teeth)

  // Short dark hair cap and layered fringe.
  sphere(body, 'hair cap', [0, 3.74, 0.015], [0.64, 0.49, 0.58], mats.hair, 40)
  sphere(body, 'left sideburn', [-0.53, 3.48, 0.12], [0.12, 0.27, 0.14], mats.hair)
  sphere(body, 'right sideburn', [0.53, 3.48, 0.12], [0.12, 0.27, 0.14], mats.hair)
  for (let i = -3; i <= 3; i += 1) {
    const x = i * 0.13
    const bang = sphere(body, `fringe ${i}`, [x, 3.73 + (Math.abs(i) % 2) * 0.035, 0.45], [0.16, 0.17, 0.15], i % 2 ? mats.hair : mats.hairLight, 20)
    bang.rotation.z = -i * 0.06
  }
  for (let i = 0; i < 5; i += 1) {
    const strand = sphere(body, `crown texture ${i}`, [(i - 2) * 0.2, 3.98 - Math.abs(i - 2) * 0.025, 0.08], [0.12, 0.09, 0.24], i % 2 ? mats.hair : mats.hairLight, 18)
    strand.rotation.z = (i - 2) * 0.12
  }

  addGlasses(body, mats)
}

export function createAvatar() {
  const root = new THREE.Group()
  root.name = 'Li Meng — stylized 3D character'
  addCharacter(root)
  return root
}

