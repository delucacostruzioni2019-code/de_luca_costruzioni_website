import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../environments/environment';

interface ContactFormData {
  name: string;
  surname?: string;
  email: string;
  mobile?: string;
  address?: string;
  service_type?: string;
  message?: string;
  privacy_accepted: boolean;
  form_type: 'contact' | 'supplier' | 'estimate';
}

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private http = inject(HttpClient);
  
  private readonly RESEND_API_KEY = environment.resendApiKey;
  private readonly FROM_EMAIL = 'noreply@delucacostruzioni.it';
  //private readonly ADMIN_EMAIL = 'delucacostruzioni2019@gmail.com';
  //todo remove after testing
  private readonly ADMIN_EMAIL = 'gennytorelli98@gmail.com';

  /**
   * Invia email di conferma all'utente e notifica all'admin
   */
  async sendContactNotifications(formData: ContactFormData): Promise<{userSent: boolean, adminSent: boolean}> {
    try {
      const [userResult, adminResult] = await Promise.allSettled([
        this.sendUserConfirmationEmail(formData),
        this.sendAdminNotificationEmail(formData)
      ]);

      return {
        userSent: userResult.status === 'fulfilled',
        adminSent: adminResult.status === 'fulfilled'
      };
    } catch (error) {
      console.error('❌ Errore nell\'invio email:', error);
      return { userSent: false, adminSent: false };
    }
  }

  /**
   * Invia email di conferma all'utente
   */
  private sendUserConfirmationEmail(formData: ContactFormData): Promise<any> {
    const subject = 'Conferma Ricezione Richiesta - De Luca Costruzioni';
    const html = this.generateUserConfirmationTemplate(formData);

    return this.sendEmail({
      to: [formData.email],
      subject,
      html,
      from: this.FROM_EMAIL
    });
  }

  /**
   * Invia notifica all'admin
   */
  private sendAdminNotificationEmail(formData: ContactFormData): Promise<any> {
    const subject = `Nuova Richiesta di Contatto - ${formData.form_type.toUpperCase()}`;
    const html = this.generateAdminNotificationTemplate(formData);

    return this.sendEmail({
      to: [this.ADMIN_EMAIL],
      subject,
      html,
      from: this.FROM_EMAIL
    });
  }

  /**
   * Metodo generico per inviare email tramite Resend
   */
  private async sendEmail(emailData: EmailRequest): Promise<any> {
    const url = 'https://api.resend.com/emails';
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      from: emailData.from || this.FROM_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    return this.http.post(url, payload, { headers }).toPromise();
  }

  /**
   * Template email di conferma per l'utente
   */
  private generateUserConfirmationTemplate(formData: ContactFormData): string {
    const formTypeLabels = {
      'contact': 'Richiesta di Contatto',
      'supplier': 'Richiesta Fornitore', 
      'estimate': 'Richiesta Preventivo Gratuito'
    };

    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conferma Ricezione Richiesta</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1a5f7a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1a5f7a;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .content h2 {
          color: #1a5f7a;
          margin-bottom: 15px;
        }
        .info-box {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #1a5f7a;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .contact-info {
          background: #e8f4f8;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .btn {
          display: inline-block;
          background: #1a5f7a;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏗️ De Luca Costruzioni</div>
          <div class="subtitle">Costruzioni e Ristrutturazioni di Qualità</div>
        </div>
        
        <div class="content">
          <h2>Grazie per averci contattato!</h2>
          
          <p>Gentile <strong>${formData.name}${formData.surname ? ' ' + formData.surname : ''}</strong>,</p>
          
          <p>Abbiamo ricevuto la sua <strong>${formTypeLabels[formData.form_type]}</strong> e la ringraziamo per l'interesse mostrato verso i nostri servizi.</p>
          
          <div class="info-box">
            <h3>📋 Riepilogo della sua richiesta:</h3>
            <p><strong>Tipo:</strong> ${formTypeLabels[formData.form_type]}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            ${formData.mobile ? `<p><strong>Telefono:</strong> ${formData.mobile}</p>` : ''}
            ${formData.service_type ? `<p><strong>Servizio:</strong> ${formData.service_type}</p>` : ''}
            ${formData.message ? `<p><strong>Messaggio:</strong><br>${formData.message}</p>` : ''}
            <p><strong>Data invio:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
          </div>
          
          <h3>⏰ Cosa succede adesso?</h3>
          <ul>
            <li>Il nostro team esaminerà la sua richiesta entro <strong>24 ore</strong></li>
            <li>La contatteremo per discutere i dettagli del progetto</li>
            <li>Organizzeremo un sopralluogo gratuito (se necessario)</li>
            <li>Le forniremo un preventivo dettagliato</li>
          </ul>
          
          <div class="contact-info">
            <h3>📞 I nostri contatti:</h3>
            <p><strong>Telefono:</strong> +39 338 924 1314</p>
            <p><strong>Email:</strong> delucacostruzioni2019@gmail.com</p>
            <p><strong>Indirizzo:</strong> Via Napoli 141, Casalnuovo, Napoli</p>
            <p><strong>Orari:</strong> Lun-Ven 08:00-18:00, Sab 08:00-13:00</p>
          </div>
          
          <p style="text-align: center;">
            <a href="https://delucacostruzioni.it" class="btn">Visita il nostro sito</a>
          </p>
          
          <p>Cordiali saluti,<br>
          <strong>Il Team De Luca Costruzioni</strong></p>
        </div>
        
        <div class="footer">
          <p>Questa è una email automatica, si prega di non rispondere.</p>
          <p>De Luca Costruzioni - Via Napoli 141, Casalnuovo (NA)</p>
          <p>&copy; ${new Date().getFullYear()} De Luca Costruzioni. Tutti i diritti riservati.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Template email notifica per l'admin
   */
  private generateAdminNotificationTemplate(formData: ContactFormData): string {
    const formTypeLabels = {
      'contact': 'Richiesta di Contatto',
      'supplier': 'Richiesta Fornitore',
      'estimate': 'Richiesta Preventivo Gratuito'
    };

    return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuova Richiesta Ricevuta</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          background: #1a5f7a;
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 20px -30px;
          text-align: center;
        }
        .alert {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .customer-info {
          background: #e8f4f8;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .action-buttons {
          text-align: center;
          margin: 20px 0;
        }
        .btn {
          display: inline-block;
          background: #1a5f7a;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 5px;
          margin: 5px;
        }
        .btn-secondary {
          background: #6c757d;
        }
        .message-box {
          background: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #1a5f7a;
          margin: 15px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f8f9fa;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 Nuova Richiesta Ricevuta</h1>
          <p>${formTypeLabels[formData.form_type]}</p>
        </div>
        
        <div class="alert">
          <strong>⚡ Azione richiesta:</strong> Una nuova richiesta è stata ricevuta e richiede la tua attenzione.
        </div>
        
        <div class="customer-info">
          <h2>👤 Informazioni Cliente</h2>
          <table>
            <tr>
              <th>Nome</th>
              <td>${formData.name}${formData.surname ? ' ' + formData.surname : ''}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td><a href="mailto:${formData.email}">${formData.email}</a></td>
            </tr>
            ${formData.mobile ? `
            <tr>
              <th>Telefono</th>
              <td><a href="tel:${formData.mobile}">${formData.mobile}</a></td>
            </tr>` : ''}
            ${formData.address ? `
            <tr>
              <th>Indirizzo</th>
              <td>${formData.address}</td>
            </tr>` : ''}
            ${formData.service_type ? `
            <tr>
              <th>Tipo Servizio</th>
              <td><strong>${formData.service_type}</strong></td>
            </tr>` : ''}
            <tr>
              <th>Data/Ora</th>
              <td>${new Date().toLocaleString('it-IT')}</td>
            </tr>
          </table>
        </div>
        
        ${formData.message ? `
        <div class="message-box">
          <h3>💬 Messaggio del Cliente:</h3>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>` : ''}
        
        <div class="action-buttons">
          <a href="mailto:${formData.email}" class="btn">📧 Rispondi via Email</a>
          ${formData.mobile ? `<a href="tel:${formData.mobile}" class="btn">📞 Chiama Cliente</a>` : ''}
          <a href="https://delucacostruzioni.it/admin" class="btn btn-secondary">🔧 Vai al Dashboard</a>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
          <h3>📋 Prossimi Passi Consigliati:</h3>
          <ol>
            <li>Contattare il cliente entro 24 ore</li>
            <li>Valutare la richiesta e le necessità</li>
            <li>Programmare eventuale sopralluogo</li>
            <li>Preparare preventivo personalizzato</li>
            <li>Aggiornare lo stato nel sistema admin</li>
          </ol>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Email automatica generata dal sistema De Luca Costruzioni</p>
          <p>${new Date().toLocaleString('it-IT')}</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Test dell'invio email (per debugging)
   */
  async testEmail(): Promise<boolean> {
    try {
      const testData: ContactFormData = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        mobile: '+39 123 456 789',
        service_type: 'Test Service',
        message: 'Questo è un messaggio di test',
        privacy_accepted: true,
        form_type: 'contact'
      };

      const result = await this.sendContactNotifications(testData);
      console.log('📧 Test email result:', result);
      return result.userSent && result.adminSent;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return false;
    }
  }
}