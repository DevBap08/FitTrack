import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.css'
})
export class AddTaskComponent {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);

  taskForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    priority: ['Medium'],
    due_date: [null]
  });

  onSubmit() {
    if (this.taskForm.valid) {
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: () => {
          this.taskForm.reset();
        },
        error: (err) => {
          console.error('Error creating task', err);
        }
      });
    }
  }
}
