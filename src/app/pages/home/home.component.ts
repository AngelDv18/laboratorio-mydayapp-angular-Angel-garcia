import { Component, OnInit } from '@angular/core';

interface Todo {  // Interfaz que define la estructura de una tarea
  id?: string; // para mantener compatibilidad
  title: string; // Título de la tarea
  completed: boolean; // Estado de la tarea
}

@Component({ // Decorador del componente
  selector: 'app-home', // Selector del componente
  templateUrl: './home.component.html' // Plantilla del componente
})
export class HomeComponent implements OnInit { // Clase del componente
  readonly STORAGE_KEY = 'mydayapp-angular'; // Clave para almacenamiento local

  todos: Todo[] = []; // Lista de tareas
  newTitle = ''; // Título de la nueva tarea
  filter: 'all' | 'active' | 'completed' = 'all'; // Filtro de tareas

  editingTodo: Todo | null = null; // Tarea en edición
  private originalTitle = ''; // Título original de la tarea en edición

  ngOnInit(): void { // Método de inicialización
    const raw = localStorage.getItem(this.STORAGE_KEY); // Obtener datos del almacenamiento local
    if (!raw) localStorage.setItem(this.STORAGE_KEY, '[]'); // Inicializar almacenamiento si está vacío
    this.todos = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]'); // Cargar tareas desde almacenamiento

    this.onHashChange(); // Aplicar filtro inicial
    window.addEventListener('hashchange', () => this.onHashChange()); // Escuchar cambios en el hash
  }

  onHashChange(): void { // Método para manejar cambios en el hash
    const h = (location.hash || '#/').replace('#/', ''); // Obtener el hash actual
    this.filter = (['all', 'active', 'completed'].includes(h) ? (h as any) : 'all'); // Aplicar filtro
  }

  private save(): void { // Método para guardar tareas en el almacenamiento local
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos)); // Guardar tareas en el almacenamiento
  }

  private generateId(): string { // Método para generar un ID único
    return Date.now().toString() + Math.random().toString(36).substr(2, 9); // Generar ID único
  }

  // --- CONTROL DE ESPACIOS ---
  private normalizeInput(s: string): string { // Método para normalizar la entrada
    // Elimina espacios al inicio y final, y colapsa espacios múltiples internos a uno solo
    return s.trim().replace(/\s+/g, ' '); // Normalizar espacios
  }

  // Validación en tiempo real para evitar espacios al inicio o múltiples espacios
  preventInvalidSpacing(event: KeyboardEvent): void { // Método para prevenir espacios inválidos
    if (event.key !== ' ') return; // Solo manejar la tecla de espacio

    const input = event.target as HTMLInputElement; // Obtener el elemento de entrada
    const cursorPos = input.selectionStart ?? 0; // Obtener la posición del cursor
    const selectionEnd = input.selectionEnd ?? cursorPos; // Obtener la posición del final de la selección
    const value = input.value;
    
    // Si hay texto seleccionado, permitir el espacio (reemplazará la selección)
    if (cursorPos !== selectionEnd) return; // Permitir espacio si hay texto seleccionado

    // Prevenir espacio al inicio del texto
    if (cursorPos === 0) {
      event.preventDefault(); 
      return;
    }
    
    // Prevenir espacios múltiples consecutivos
    // Solo bloquear si el carácter inmediatamente anterior es un espacio
    if (cursorPos > 0 && value.charAt(cursorPos - 1) === ' ') {
      event.preventDefault();
      return;
    }
  }

  // Manejo del evento input para normalización en tiempo real
  onTitleInput(event: Event): void {
    const input = event.target as HTMLInputElement; // Obtener el elemento de entrada
    this.newTitle = input.value; // Actualizar el título de la nueva tarea

    // No se debe normalizar durante la escritura normal, solo al final
    // lopense para que Esto permitiera escribir naturalmente 
  }

  // Manejo del evento input para edición
  onEditInput(input: HTMLInputElement): void {
    // como lo pense fue que No normalizara durante la escritura, para que permitiera un flujo natural
  }

  // Manejo del pegado
  onPaste(event: ClipboardEvent): void {
    event.preventDefault(); // Prevenir el comportamiento por defecto

    const input = event.target as HTMLInputElement; // Obtener el elemento de entrada
    const pastedText = event.clipboardData?.getData('text') || ''; // Obtener el texto del portapapeles
    const cursorStart = input.selectionStart ?? 0; // Obtener la posición de inicio del cursor
    const cursorEnd = input.selectionEnd ?? cursorStart; // Obtener la posición de finalización del cursor

    // Construir el nuevo valor
    const beforeCursor = input.value.substring(0, cursorStart); // Obtener el texto antes del cursor
    const afterCursor = input.value.substring(cursorEnd); // Obtener el texto después del cursor
    const newValue = beforeCursor + pastedText + afterCursor; // Construir el nuevo valor

    // Normalizar el resultado completo
    const normalizedValue = this.normalizeInput(newValue); // Normalizar el nuevo valor
    input.value = normalizedValue; // Asignar el valor normalizado al input

    // Calcular nueva posición del cursor
    const normalizedPasted = this.normalizeInput(pastedText); // Normalizar el texto pegado
    const normalizedBefore = this.normalizeInput(beforeCursor); // Normalizar el texto antes del cursor
    let newCursorPos = normalizedBefore.length; // Nueva posición del cursor

    // Si el texto pegado no está vacío después de normalizar, mover el cursor
    if (normalizedPasted.length > 0) {
      newCursorPos += normalizedPasted.length;
      // Agregar 1 si necesitamos un espacio entre el texto anterior y el pegado
      if (normalizedBefore.length > 0 && !normalizedBefore.endsWith(' ') && !normalizedPasted.startsWith(' ')) {
        newCursorPos += 1; // Ajustar la nueva posición del cursor
      }
    }

    newCursorPos = Math.min(newCursorPos, normalizedValue.length); // Ajustar la nueva posición del cursor

    try {
      input.setSelectionRange(newCursorPos, newCursorPos); // Ajustar la posición del cursor
    } catch (e) {
      // Ignorar errores de selección
    }
    
    // Actualizar el modelo si es el input principal
    if (input.classList.contains('new-todo')) { // Verificar si es el input principal
      this.newTitle = normalizedValue; // Actualizar el título de la nueva tarea
    }
  }


  add(): void { // Método para agregar una nueva tarea
    const title = this.normalizeInput(this.newTitle); // Normalizar el título de la nueva tarea
    if (!title) return; // Si el título no es válido, no hacer nada

    // Crear una nueva tarea
    const newTodo: Todo = {
      id: this.generateId(),
      title: title,
      completed: false
    };
    // Agregar la nueva tarea a la lista
    this.todos.push(newTodo);
    this.newTitle = '';
    this.save();
  }
  // Método para alternar el estado de una tarea
  toggle(todo: Todo): void {
    todo.completed = !todo.completed;
    this.save();
  }
  // Método para eliminar una tarea
  remove(todo: Todo): void {
    this.todos = this.todos.filter(x => x !== todo);
    this.save();
  }
  // Método para editar una tarea
  edit(todo: Todo, value: string): void {
    const normalizedTitle = this.normalizeInput(value);
    if (!normalizedTitle) {
      this.remove(todo);
      return;
    }
    todo.title = normalizedTitle;
    this.save();
  }
  // Método para limpiar tareas completadas
  clearCompleted(): void {
    this.todos = this.todos.filter(x => !x.completed);
    this.save();
  }
  // Método para obtener la cantidad de tareas restantes
  remaining(): number {
    return this.todos.filter(x => !x.completed).length;
  }
  // Método para filtrar tareas
  get filtered(): Todo[] {
    if (this.filter === 'active') return this.todos.filter((x: Todo) => !x.completed);
    if (this.filter === 'completed') return this.todos.filter((x: Todo) => x.completed);
    return this.todos;
  }
  // Método para verificar si hay tareas completadas
  get hasCompleted(): boolean {
    return this.todos.some((t: Todo) => t.completed);
  }

  // Métodos de edición
  startEdit(todo: Todo, input?: HTMLInputElement): void {
    this.editingTodo = todo;
    this.originalTitle = todo.title;
    setTimeout(() => {
      input?.focus();
      input?.select(); // Seleccionar todo el texto para facilitar la edición
    });
  }
  // Método para cancelar la edición de una tarea
  cancelEdit(todo: Todo): void {
    if (this.editingTodo === todo) {
      todo.title = this.originalTitle;
      this.editingTodo = null;
    }
  }
  // Método para confirmar la edición de una tarea
  commitEdit(todo: Todo, value: string): void {
    if (this.editingTodo === todo) {
      this.edit(todo, value);
      this.editingTodo = null;
    }
  }
}
// Métodos de edición 