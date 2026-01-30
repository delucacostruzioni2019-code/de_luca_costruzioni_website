import { Component, OnInit, inject } from '@angular/core';
import { BannerCta } from "../../components/banner-cta/banner-cta";
import { Certifications } from "../../components/certifications/certifications";
import { CompanyStatsComponent } from "../../components/company-stats/company-stats";
import { HeroBanner } from "../../components/hero-banner/hero-banner";
import { ImgSectionHeader } from "../../components/img-section-header/img-section-header";
import { MissionVision } from "../../components/mission-vision/mission-vision";
import { Team } from "../../components/team/team";
import { SEOService } from '../../services/seo.service';

@Component({
  selector: 'app-agency',
  standalone: true,
  templateUrl: './agency.html',
  styleUrl: './agency.scss',
  imports: [HeroBanner, BannerCta, ImgSectionHeader, MissionVision, Certifications, CompanyStatsComponent, Team],
})
export default class Agency implements OnInit {
  private seoService = inject(SEOService);

  ngOnInit(): void {
    // Configura SEO per pagina chi siamo
    this.seoService.updatePageSEO('chi_siamo');
  }
}
