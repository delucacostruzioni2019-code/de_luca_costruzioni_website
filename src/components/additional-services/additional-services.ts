import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  id: number;
  name: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}

@Component({
  selector: 'app-additional-services',
  imports: [CommonModule],
  templateUrl: './additional-services.html',
  styleUrl: './additional-services.scss',
})
export class AdditionalServices {
  
  services: Service[] = [
    {
      id: 1,
      name: 'RISTRUTTURAZIONI COMPLETE',
      title: 'Ristrutturazioni Complete',
      description: 'Trasformiamo completamente i tuoi spazi abitativi con soluzioni innovative e materiali di alta qualità. Dalla progettazione alla realizzazione, ci occupiamo di ogni aspetto del tuo progetto.',
      image: 'assets/images/services/casa_sk.jpeg',
      alt: 'Ristrutturazione completa di appartamento'
    },
    {
      id: 2,
      name: 'NUOVE COSTRUZIONI',
      title: 'Nuove Costruzioni',
      description: 'Realizziamo la casa dei tuoi sogni dalle fondamenta. Ogni progetto è sviluppato con tecnologie moderne e criteri di efficienza energetica per garantire comfort e sostenibilità.',
      image: 'assets/images/services/building.jpeg',
      alt: 'Costruzione di nuova abitazione'
    },
    {
      id: 3,
      name: 'MANUTENZIONI SPECIALIZZATE',
      title: 'Manutenzioni Specializzate',
      description: 'Servizi di manutenzione ordinaria e straordinaria per preservare il valore del tuo immobile. Interventi mirati per sistemi idraulici, elettrici, tetti e facciate.',
      image: 'assets/images/services/maintenance.jpeg',
      alt: 'Lavori di manutenzione specializzata'
    }
  ];
}
