import { Controller, Get } from '@nestjs/common';
import { HomepageService } from '../services/homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  getHomepage() {
    return this.homepageService.getHomepageData();
  }
} 