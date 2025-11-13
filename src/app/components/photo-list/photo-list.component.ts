import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhotoService } from '../../services/photo.service';
import { Photo } from '../../models/photo.model';


@Component({
    selector: 'app-photo-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './photo-list.component.html',
    styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent implements OnInit {
    photos: Photo[] = [];
    originalPhotos: Photo[] = []; // Fotos originales del JSON
    localPhotos: Photo[] = [];    // Fotos agregadas localmente

    // Para el formulario de agregar (tfoot)
    newPhoto: Photo = {
        albumId: 0,
        title: '',
        url: '',
        thumbnailUrl: ''
    };

    // Para el modal de editar
    editingPhoto: Photo = {
        albumId: 0,
        title: '',
        url: '',
        thumbnailUrl: ''
    };

    showModal: boolean = false;
    currentEditId: number = 0;

    constructor(
        private photoService: PhotoService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getPhotos();
    }

    // Obtener y mostrar listado
    getPhotos(): void {
        this.photoService.getAll().subscribe({
            next: (response) => {
                // Limitamos a 20 fotos para no sobrecargar la vista
                this.originalPhotos = response.slice(0, 20);
                this.updatePhotosList();
            },
            error: (error) => {
                console.error('Error loading photos:', error);
            }
        });
    }

    // Combinar fotos originales con las locales
    private updatePhotosList(): void {
        // Crear un nuevo array completamente para forzar detección de cambios
        this.photos = [];
        this.photos = [...this.originalPhotos, ...this.localPhotos]; // Originales primero, locales al final
        console.log('Photos updated:', this.photos.length, 'total (', this.localPhotos.length, 'local +', this.originalPhotos.length, 'original)');
    }

    // Agregar nuevo objeto (desde tfoot)
    addPhoto(): void {
        console.log('addPhoto called with:', this.newPhoto);
        
        if (this.newPhoto.albumId > 0 &&
            this.newPhoto.title.trim() &&
            this.newPhoto.url.trim() &&
            this.newPhoto.thumbnailUrl.trim()) {

            // Crear copia del objeto para enviar al servicio
            const photoToAdd = { ...this.newPhoto };

            console.log('Calling service to create photo:', photoToAdd);

            // Llamar al servicio para crear la foto
            this.photoService.create(photoToAdd).subscribe({
                next: (response) => {
                    console.log('Service response:', response);

                    // Crear el objeto con el ID devuelto por el servicio
                    const newPhotoWithId: Photo = {
                        id: response.id || Date.now(),
                        albumId: photoToAdd.albumId,
                        title: photoToAdd.title,
                        url: photoToAdd.url,
                        thumbnailUrl: photoToAdd.thumbnailUrl
                    };

                    console.log('📸 ADDING NEW PHOTO:', newPhotoWithId);

                    // 🔥 FORZAR ADICIÓN DE FILA
                    this.forceAddRow(newPhotoWithId);

                    // Limpiar formulario
                    this.newPhoto = {
                        albumId: 0,
                        title: '',
                        url: '',
                        thumbnailUrl: ''
                    };

                    console.log('✅ Photo added and row forced!');
                    alert('Photo added successfully!');
                },
                error: (error) => {
                    console.error('Error creating photo:', error);
                    alert('Error adding photo. Please try again.');
                }
            });
        } else {
            alert('Please complete all fields.');
        }
    }

    // Abrir modal para actualizar
    openEditModal(photo: Photo): void {
        this.currentEditId = photo.id!;
        this.editingPhoto = {
            id: photo.id,
            albumId: photo.albumId,
            title: photo.title,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl
        };
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.currentEditId = 0;
    }

    // Confirmar actualización (desde modal)
    confirmEdit(): void {
        if (this.editingPhoto.albumId > 0 &&
            this.editingPhoto.title.trim() &&
            this.editingPhoto.url.trim() &&
            this.editingPhoto.thumbnailUrl.trim()) {

            // Verificar si es una foto local o original
            const localIndex = this.localPhotos.findIndex(p => p.id === this.currentEditId);
            const originalIndex = this.originalPhotos.findIndex(p => p.id === this.currentEditId);
            
            if (localIndex !== -1) {
                // Actualizar foto local
                this.localPhotos[localIndex] = { ...this.editingPhoto };
            } else if (originalIndex !== -1) {
                // Actualizar foto original
                this.originalPhotos[originalIndex] = { ...this.editingPhoto };
            }
            
            this.updatePhotosList();
            this.closeModal();
            alert('Photo updated successfully!');
        } else {
            alert('All fields are required.');
        }
    }

    // Dar de baja (eliminar)
    deletePhoto(id: number): void {
        if (confirm('Are you sure you want to delete this photo?')) {
            // Verificar si es una foto local o original
            const isLocalPhoto = this.localPhotos.some(p => p.id === id);
            
            if (isLocalPhoto) {
                // Eliminar de fotos locales
                this.localPhotos = this.localPhotos.filter(p => p.id !== id);
                this.updatePhotosList();
                alert('Photo deleted successfully!');
            } else {
                // Eliminar de fotos originales (solo visual, no del servidor)
                this.originalPhotos = this.originalPhotos.filter(p => p.id !== id);
                this.updatePhotosList();
                alert('Photo hidden successfully! (Will reappear on refresh)');
            }
        }
    }

    // Método para refrescar y volver a los datos originales
    refreshPhotos(): void {
        this.localPhotos = [];
        this.photos = []; // Limpiar completamente
        this.getPhotos(); // Esto llamará a updatePhotosList()
        alert('Photos refreshed to original state!');
    }

    // TrackBy function para ayudar a Angular a detectar cambios
    trackByFn(index: number, item: Photo): number {
        return item.id!;
    }

    // Función para forzar la adición de una nueva fila en la tabla
    private forceAddRow(newPhoto: Photo): void {
        console.log('🔥 FORCING ROW ADDITION for:', newPhoto);
        
        // 1. Agregar al final de localPhotos
        this.localPhotos = [...this.localPhotos, newPhoto];
        
        // 2. Recrear completamente el array photos
        const tempPhotos = [...this.photos];
        this.photos = [];
        setTimeout(() => {
            this.photos = [...tempPhotos, newPhoto]; // Agregar al final
            
            // 3. Forzar múltiples ciclos de detección
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 50);
        }, 10);
        
        console.log('🔥 ROW ADDITION FORCED - New photos count:', this.photos.length + 1);
    }

    // TEST: Método para probar agregar una foto hardcodeada
    testAddPhoto(): void {
        const testPhoto: Photo = {
            id: Date.now(),
            albumId: 999,
            title: 'TEST PHOTO - ' + new Date().toLocaleTimeString(),
            url: 'https://via.placeholder.com/600/92c952',
            thumbnailUrl: 'https://via.placeholder.com/150/92c952'
        };

        console.log('🧪 TEST: Adding hardcoded photo:', testPhoto);
        
        // Usar la función de forzar adición de filas
        this.forceAddRow(testPhoto);

        alert('TEST photo added! Check if it appears in the table.');
    }
}