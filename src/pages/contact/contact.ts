import { Component, OnInit, inject } from '@angular/core';
import { HeroBanner } from "../../components/hero-banner/hero-banner";
import { FollowOn } from "../../components/follow-on/follow-on";
import { Map } from "../../components/map/map";
import { FormSupplier } from "../../components/form-supplier/form-supplier";
import { FormUser } from "../../components/form-user/form-user";
import { ContactInfo } from "../../components/contact-info/contact-info";
import { SEOService } from '../../services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  imports: [HeroBanner, FollowOn, Map, FormSupplier, FormUser, ContactInfo],
})
export default class Contact implements OnInit {
  private seoService = inject(SEOService);

  ngOnInit(): void {
    // Configura SEO per pagina contatti
    this.seoService.updatePageSEO('contatti');
  }
}
