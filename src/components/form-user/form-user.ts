import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSuccessMessage } from '../form-success-message/form-success-message';
import { LeadService } from '../../services/lead';
import { ContactLead } from '../../models/lead';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-form-user',
  imports: [ReactiveFormsModule, CommonModule, FormSuccessMessage],
  templateUrl: './form-user.html',
  styleUrl: './form-user.scss',
})
export class FormUser implements OnInit {
  private fb = inject(FormBuilder);
  private leadService = inject(LeadService);
  private emailService = inject(EmailService);

  contactForm!: FormGroup;
  isSubmitted = false;
  isSubmitting = false;
 emailStatus = { userSent: false, adminSent: false };

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      address: [''],
      service_type: [''],
      message: [''],
      privacy_accepted: [false, Validators.requiredTrue]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      console.log('Form Inviato:', this.contactForm.value);
      this.isSubmitting = true;

      const leadData: Omit<ContactLead, 'id' | 'created_at' | 'lead_status' | 'read'> = {
        ...this.contactForm.value,
        lead_type: 'contact' as const
      };

      try {
        // 1. Salva nel database
        const savedLead = await this.leadService.saveContactLead(leadData);
        console.log('✅ Lead salvato con successo', savedLead);

        // 2. Invia email notifications
        console.log('📧 Invio email notifications...');
        const emailFormData = {
          ...this.contactForm.value,
          form_type: 'contact' as const
        };

        const emailResults = await this.emailService.sendContactNotifications(emailFormData);
        this.emailStatus = emailResults;

        console.log('📧 Email results:', emailResults);

        if (emailResults.userSent) {
          console.log('✅ Email di conferma inviata all\'utente');
        } else {
          console.warn('⚠️ Errore nell\'invio email utente');
        }

        if (emailResults.adminSent) {
          console.log('✅ Email di notifica inviata all\'admin');
        } else {
          console.warn('⚠️ Errore nell\'invio email admin');
        }

        // 3. Mostra success message
        this.isSubmitted = true;
        this.isSubmitting = false;
        this.contactForm.reset();

      } catch (error) {
        console.error('❌ Errore nel processo di invio:', error);
        alert('Si è verificato un errore durante l\'invio. Riprova.');
        this.isSubmitting = false;
      }

    } else {
      this.contactForm.markAllAsTouched();
      alert('Per favore, compila tutti i campi obbligatori correttamente.');
    }
  }

  resetForm(): void {
    this.isSubmitted = false;
    this.contactForm.reset();
    this.contactForm.get('privacy_accepted')?.setValue(false);
  }
}
