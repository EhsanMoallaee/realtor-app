import { Controller, Get, Post, Patch, Delete } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dtos/home.dto';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService: HomeService) {}

    @Get()
    getHomes(): Promise<HomeResponseDto[]> {
        return this.homeService.getHomes();
    }

    @Get(':id')
    getHomeById() {
        return {};
    }

    @Post()
    createHome() {
        return {};
    }

    @Patch(':id')
    updateHome() {
        return {};
    }

    @Delete(':id')
    deleteHome() {
        return 'done';
    }
}
