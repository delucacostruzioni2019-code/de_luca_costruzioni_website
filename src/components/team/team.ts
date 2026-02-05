import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  bio?: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.html',
  styleUrls: ['./team.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Team {
  teamMembers: TeamMember[] = [
        {
      id: 1,
      name: 'Giuseppe De Luca',
      role: 'Founder',
      image: 'assets/images/team/giuseppe.jpeg',
      bio: 'Fondatore e geometra'
    },
    {
      id: 2,
      name: 'Pasquale De Luca',
      role: 'CEO',
      image: 'assets/images/team/pasquale.png',
      bio: 'Amministratore e responsabile del personale e del contatto con i clienti'
    },
    {
      id: 3,
      name: 'Grazia Spagnoli',
      role: 'Project Narrator on Social Media',
      image: 'assets/images/team/grazia.png',
      bio: 'Volto principale dell\'azienda sui social e responsabile della comunicazione'
    },
    /*{
      id: 4,
      name: 'Nunzia Beneduce',
      role: 'Amministratrice e contabile',
      image: 'assets/images/team/team-1.jpg',
      bio: 'Amministratrice interna e contabile esperta'
    },
    {
      id: 5,
      name: 'Agostino Toti',
      role: 'Geometra',
      image: 'assets/images/team/team-1.jpg',
      bio: 'Geometra con esperienza e addetto a sopralluoghi e controllo qualità'
    }*/
  ];
}