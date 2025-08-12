import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component'; 


@NgModule({ // Módulo principal
  declarations: [AppComponent, HomeComponent], // Declaración de componentes
  imports: [BrowserModule, FormsModule, AppRoutingModule], // Importación de módulos
  providers: [], // Proveedores de servicios
  bootstrap: [AppComponent] // Componente raíz
})
export class AppModule {} // Módulo principal
