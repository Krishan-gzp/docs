import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import * as OBC from '@thatopen/components'
import * as OBCF from '@thatopen/components-front'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { LoadedModel } from '../App'

interface Viewer3DProps {
  models: LoadedModel[]
  selectedModel: LoadedModel | null
  onModelSelect: (model: LoadedModel) => void
}

const Viewer3D: React.FC<Viewer3DProps> = ({ models, selectedModel, onModelSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const componentsRef = useRef<OBC.Components | null>(null)
  const worldRef = useRef<OBC.SimpleWorld | null>(null)
  const ifcLoaderRef = useRef<OBC.IfcLoader | null>(null)
  const gltfLoaderRef = useRef<GLTFLoader | null>(null)
  const loadedModelsRef = useRef<Map<string, THREE.Object3D>>(new Map())
  const explodedGroupsRef = useRef<Map<string, THREE.Group>>(new Map())
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewerStats, setViewerStats] = useState({
    vertices: 0,
    triangles: 0,
    objects: 0
  })

  // Initialize the 3D viewer
  const initializeViewer = useCallback(async () => {
    if (!containerRef.current) return

    try {
      // Create components instance
      const components = new OBC.Components()
      componentsRef.current = components

      // Create world with scene, camera, and renderer
      const worlds = components.get(OBC.Worlds)
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.OrthoPerspectiveCamera,
        OBCF.PostproductionRenderer
      >()

      worldRef.current = world

      // Initialize scene
      world.scene = new OBC.SimpleScene(components)
      world.scene.setup()

      // Initialize camera
      world.camera = new OBC.OrthoPerspectiveCamera(components)
      world.camera.controls.setLookAt(12, 6, 8, 0, 0, -10)

      // Initialize renderer
      world.renderer = new OBCF.PostproductionRenderer(components, containerRef.current)
      world.renderer.postproduction.enabled = true

      // Initialize components
      await components.init()

      // Set up IFC loader
      const ifcLoader = components.get(OBC.IfcLoader)
      ifcLoaderRef.current = ifcLoader
      await ifcLoader.setup()

      // Set up GLTF loader
      const gltfLoader = new GLTFLoader()
      gltfLoaderRef.current = gltfLoader

      // Set up lighting
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 10, 5)
      directionalLight.castShadow = true
      directionalLight.shadow.mapSize.setScalar(2048)
      world.scene.three.add(directionalLight)

      const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
      world.scene.three.add(ambientLight)

      // Set up grids
      const grids = components.get(OBC.Grids)
      const grid = grids.create(world)
      grid.material.uniforms.uColor.value = new THREE.Color(0x424242)

      // Set up raycaster for object picking
      const raycaster = components.get(OBC.Raycasters)
      const caster = raycaster.get(world)
      
      caster.enabled = true
      containerRef.current.addEventListener('click', (event) => {
        const result = caster.castRay()
        if (result) {
          handleObjectClick(result.object)
        }
      })

      // Update viewer stats
      updateViewerStats()

    } catch (err) {
      console.error('Failed to initialize viewer:', err)
      setError('Failed to initialize 3D viewer')
    }
  }, [])

  // Handle object click for selection
  const handleObjectClick = useCallback((object: THREE.Object3D) => {
    // Find which model this object belongs to
    for (const model of models) {
      if (model.object && isChildOf(object, model.object)) {
        onModelSelect(model)
        break
      }
    }
  }, [models, onModelSelect])

  // Check if object is child of parent
  const isChildOf = (object: THREE.Object3D, parent: THREE.Object3D): boolean => {
    let current = object
    while (current.parent) {
      if (current.parent === parent) return true
      current = current.parent
    }
    return false
  }

  // Load a single model
  const loadModel = useCallback(async (model: LoadedModel) => {
    if (!componentsRef.current || !worldRef.current || !ifcLoaderRef.current || !gltfLoaderRef.current) {
      throw new Error('Viewer not initialized')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(model.file.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`)
      }

      let loadedObject: THREE.Object3D

      if (model.file.extension === '.ifc') {
        // Load IFC file using ThatOpen IFC loader
        const buffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)
        const fragmentsGroup = await ifcLoaderRef.current.load(uint8Array)
        loadedObject = fragmentsGroup.three
        
        // Store IFC metadata
        const properties = await ifcLoaderRef.current.getProperties(fragmentsGroup.uuid)
        model.metadata = properties

      } else if (model.file.extension === '.glb' || model.file.extension === '.gltf') {
        // Load GLB/GLTF file using Three.js GLTF loader
        const buffer = await response.arrayBuffer()
        const gltf = await new Promise<any>((resolve, reject) => {
          gltfLoaderRef.current!.parse(buffer, '', resolve, reject)
        })
        
        loadedObject = gltf.scene
        
        // Store GLTF metadata
        model.metadata = {
          animations: gltf.animations.length,
          scenes: gltf.scenes.length,
          cameras: gltf.cameras?.length || 0,
          materials: gltf.materials?.length || 0,
          textures: gltf.textures?.length || 0
        }

      } else {
        throw new Error(`Unsupported file format: ${model.file.extension}`)
      }

      // Add to scene
      worldRef.current.scene.three.add(loadedObject)
      loadedModelsRef.current.set(model.file.id, loadedObject)

      // Update model object reference
      model.object = loadedObject

      // Fit camera to object
      const box = new THREE.Box3().setFromObject(loadedObject)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const distance = maxDim * 2
      
      worldRef.current.camera.controls.setLookAt(
        center.x + distance,
        center.y + distance,
        center.z + distance,
        center.x,
        center.y,
        center.z
      )

      updateViewerStats()

    } catch (err) {
      console.error('Failed to load model:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Apply explode/assemble transformation
  const applyExplodeTransform = useCallback((model: LoadedModel) => {
    const object = loadedModelsRef.current.get(model.file.id)
    if (!object) return

    if (model.isExploded && model.explodeAmount > 0) {
      // Create exploded view
      const center = new THREE.Vector3()
      const box = new THREE.Box3().setFromObject(object)
      box.getCenter(center)

      object.traverse((child) => {
        if (child.isMesh) {
          const childCenter = new THREE.Vector3()
          const childBox = new THREE.Box3().setFromObject(child)
          childBox.getCenter(childCenter)

          const direction = childCenter.clone().sub(center).normalize()
          const distance = model.explodeAmount * 5 // Scale factor

          child.position.copy(child.userData.originalPosition || child.position)
          if (!child.userData.originalPosition) {
            child.userData.originalPosition = child.position.clone()
          }
          
          child.position.add(direction.multiplyScalar(distance))
        }
      })
    } else {
      // Restore original positions
      object.traverse((child) => {
        if (child.isMesh && child.userData.originalPosition) {
          child.position.copy(child.userData.originalPosition)
        }
      })
    }
  }, [])

  // Update viewer statistics
  const updateViewerStats = useCallback(() => {
    if (!worldRef.current) return

    let vertices = 0
    let triangles = 0
    let objects = 0

    worldRef.current.scene.three.traverse((object) => {
      if (object.isMesh) {
        objects++
        const geometry = object.geometry
        if (geometry.attributes.position) {
          vertices += geometry.attributes.position.count
          if (geometry.index) {
            triangles += geometry.index.count / 3
          } else {
            triangles += geometry.attributes.position.count / 3
          }
        }
      }
    })

    setViewerStats({ vertices, triangles, objects })
  }, [])

  // Handle model visibility
  const updateModelVisibility = useCallback((model: LoadedModel) => {
    const object = loadedModelsRef.current.get(model.file.id)
    if (object) {
      object.visible = model.isVisible
    }
  }, [])

  // Load models when they change
  useEffect(() => {
    const loadNewModels = async () => {
      for (const model of models) {
        if (!loadedModelsRef.current.has(model.file.id) && !model.object) {
          try {
            await loadModel(model)
          } catch (err) {
            console.error(`Failed to load model ${model.file.originalName}:`, err)
            setError(`Failed to load ${model.file.originalName}`)
          }
        }
      }
    }

    loadNewModels()
  }, [models, loadModel])

  // Update model properties when they change
  useEffect(() => {
    models.forEach(model => {
      updateModelVisibility(model)
      applyExplodeTransform(model)
    })
  }, [models, updateModelVisibility, applyExplodeTransform])

  // Initialize viewer on mount
  useEffect(() => {
    initializeViewer()

    return () => {
      // Cleanup
      if (componentsRef.current) {
        componentsRef.current.dispose()
      }
    }
  }, [initializeViewer])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (worldRef.current?.renderer) {
        worldRef.current.renderer.resize()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="viewer-3d">
      <div ref={containerRef} className="viewer-canvas" />
      
      {/* Viewer overlay with controls and info */}
      <div className="viewer-overlay">
        <div className="viewer-info">
          {viewerStats.objects > 0 && (
            `${viewerStats.objects.toLocaleString()} objects • ${viewerStats.vertices.toLocaleString()} vertices`
          )}
        </div>
        
        {loading && (
          <div className="viewer-controls">
            <div className="loading-spinner">
              <div className="spinner"></div>
              Loading model...
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {selectedModel && (
          <div className="viewer-controls">
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <strong>{selectedModel.file.originalName}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {selectedModel.file.extension.toUpperCase()} • {formatFileSize(selectedModel.file.size)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Utility function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default Viewer3D