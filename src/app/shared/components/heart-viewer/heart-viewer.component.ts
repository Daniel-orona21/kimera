import { Component, ElementRef, AfterViewInit, OnDestroy, HostListener, Input, Output, EventEmitter } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-heart-viewer',
  templateUrl: './heart-viewer.component.html',
  styleUrls: ['./heart-viewer.component.scss'],
  standalone: true,
})
export class HeartViewerComponent implements AfterViewInit, OnDestroy {
  @Input() scrollY: number = 0;
  @Input() scrollDirection: number = 1;
  @Output() modelReady = new EventEmitter<THREE.Group>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Group;
  private mixer!: THREE.AnimationMixer;
  private clock = new THREE.Clock();

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.initThree();
    this.loadModel();
  }

  ngOnDestroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree(): void {
    const container = this.el.nativeElement;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 500);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    loader.load(
      '/model/heart.glb', // Asegúrate que la ruta sea correcta
      (gltf) => {
        this.model = gltf.scene;
        // Guardaremos el estado de la rotación en el objeto userData del modelo
        this.model.userData = {
          scrollDrivenRotationY: 0,
          scrollDrivenRotationX: 0,
          autoRotationY: 0,
          lastScrollDirection: 1
        };
        this.model.scale.set(5, 5, 5); // o 2, 2, 2 para hacerlo más grande
  
        // ✅ Cambiar color después de cargar
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                if ((mat as THREE.MeshStandardMaterial).color) {
                  (mat as THREE.MeshStandardMaterial).color.set('#ffffff'); // tu color
                }
              });
            } else if ((mesh.material as THREE.MeshStandardMaterial).color) {
              (mesh.material as THREE.MeshStandardMaterial).color.set('#ffffff'); // tu color
            }
          }
        });
  
        this.scene.add(this.model);
        this.startAnimationLoop();
        this.modelReady.emit(this.model); // ¡Avisamos que el modelo está listo!
      },
      undefined,
      (error) => {
        console.error('An error happened while loading the model:', error);
      }
    );
  }

  private startAnimationLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (this.model) {
        // Almacenamos la última dirección del scroll si ha cambiado
        if (this.scrollDirection !== this.model.userData['lastScrollDirection']) {
          this.model.userData['lastScrollDirection'] = this.scrollDirection;
        }

        // 1. Calcular el objetivo de rotación basado en el scroll actual
        const targetScrollDrivenY = this.scrollY * 0.002;

        // 2. Suavizar (LERP) la rotación del scroll para evitar saltos
        this.model.userData['scrollDrivenRotationY'] += (targetScrollDrivenY - this.model.userData['scrollDrivenRotationY']) * 0.05;
        
        // 3. Aplicar una rotación automática constante usando la última dirección del scroll
        this.model.userData['autoRotationY'] += 0.005 * this.model.userData['lastScrollDirection'];

        // 4. Combinar la rotación automática y la rotación por scroll
        this.model.rotation.y = this.model.userData['autoRotationY'] + this.model.userData['scrollDrivenRotationY'];
        this.model.rotation.x = this.model.userData['scrollDrivenRotationX'];
      }

      if (this.mixer) {
        this.mixer.update(this.clock.getDelta());
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
      const container = this.el.nativeElement;
      if (this.camera && this.renderer) {
          this.camera.aspect = container.clientWidth / container.clientHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(container.clientWidth, container.clientHeight);
      }
  }
}
