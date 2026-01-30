import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSuccessMessage } from '../form-success-message/form-success-message';
import { LeadService } from '../../services/lead';
import { SupplierLead } from '../../models/lead';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-form-supplier',
  imports: [ReactiveFormsModule, CommonModule, FormSuccessMessage],
  templateUrl: './form-supplier.html',
  styleUrl: './form-supplier.scss',
})
export class FormSupplier implements OnInit {
  private fb = inject(FormBuilder);
  private leadService = inject(LeadService);
  private emailService = inject(EmailService);

  supplierForm!: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
  emailStatus = { userSent: false, adminSent: false };

  ngOnInit(): void {
    this.supplierForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mobile: ['', Validators.required],
      company: ['', Validators.required],
      role: [''],
      address: [''],
      email: ['', [Validators.required, Validators.email]],
      pec: ['', Validators.email],
      service_type: [''],
      notes: [''],
      privacy_accepted: [false, Validators.requiredTrue]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.supplierForm.valid) {
      console.log('Form Fornitore Inviato:', this.supplierForm.value);
      this.isSubmitting = true;

      const leadData: Omit<SupplierLead, 'id' | 'created_at' | 'lead_status' | 'read'> = {
        ...this.supplierForm.value,
        lead_type: 'supplier' as const
      };

      try {
        // 1. Salva nel database
        const savedLead = await this.leadService.saveContactLead(leadData);
        console.log('✅ Richiesta fornitore salvata con successo', savedLead);

        // 2. Invia email notifications
        console.log('📧 Invio email notifications fornitore...');
        const emailFormData = {
          ...this.supplierForm.value,
          form_type: 'supplier' as const
        };

        const emailResults = await this.emailService.sendContactNotifications(emailFormData);
        this.emailStatus = emailResults;

        console.log('📧 Email results (supplier):', emailResults);

        // 3. Mostra success message
        this.isSubmitted = true;
        this.isSubmitting = false;
        this.supplierForm.reset();

      } catch (error) {
        console.error('❌ Errore nel processo di invio fornitore:', error);
        alert('Si è verificato un errore durante l\'invio. Riprova.');
        this.isSubmitting = false;
      }
    } else {
      this.supplierForm.markAllAsTouched();
      alert('Per favore, compila tutti i campi obbligatori correttamente.');
    }
  }

  resetForm(): void {
    this.isSubmitted = false;
    this.supplierForm.reset();
    this.supplierForm.get('privacy_accepted')?.setValue(false);
  }
}
