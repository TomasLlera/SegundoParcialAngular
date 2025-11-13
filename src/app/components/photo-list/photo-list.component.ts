import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
                this.photos = response.slice(0, 20);
            },
            error: (error) => {
                console.error('Error loading photos:', error);
            }
        });
    }

    // Agregar nuevo objeto (desde tfoot)
    addPhoto(): void {
        if (this.newPhoto.albumId > 0 &&
            this.newPhoto.title.trim() &&
            this.newPhoto.url.trim() &&
            this.newPhoto.thumbnailUrl.trim()) {

            this.photoService.create(this.newPhoto).subscribe({
                next: (response) => {
                    const newPhotoWithId = {
                        ...this.newPhoto,
                        id: response.id || Math.floor(Math.random() * 10000)
                    };

                    // Crear nuevo array
                    this.photos = [newPhotoWithId, ...this.photos];

                    // Forzar detección de cambios
                    this.cdr.detectChanges();

                    // Limpiar formulario
                    this.newPhoto = {
                        albumId: 0,
                        title: '',
                        url: '',
                        thumbnailUrl: ''
                    };

                    alert('Photo added successfully!');
                },
                error: (error) => {
                    console.error('Error adding photo:', error);
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

            this.photoService.update(this.currentEditId, this.editingPhoto).subscribe({
                next: (response) => {
                    const index = this.photos.findIndex(p => p.id === this.currentEditId);
                    if (index !== -1) {
                        this.photos[index] = response;
                    }
                    this.closeModal();
                    alert('Photo updated successfully!');
                },
                error: (error) => {
                    console.error('Error updating photo:', error);
                }
            });
        } else {
            alert('All fields are required.');
        }
    }

    // Dar de baja (eliminar)
    deletePhoto(id: number): void {
        if (confirm('Are you sure you want to delete this photo?')) {
            this.photoService.delete(id).subscribe({
                next: () => {
                    this.photos = this.photos.filter(p => p.id !== id);
                    alert('Photo deleted successfully!');
                },
                error: (error) => {
                    console.error('Error deleting photo:', error);
                }
            });
        }
    }
}