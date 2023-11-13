import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Query,
    Param,
    ParseIntPipe,
    Body
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dtos/homeResponse.dto';
import { PropertyType } from '@prisma/client';
import { CreateHomeDto, UpdateHomeDto } from './dtos/home.dto';

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) {}

    @Get()
    getHomes(
        @Query('city') city?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('propertyType') propertyType?: PropertyType
    ): Promise<HomeResponseDto[]> {
        const price =
            minPrice || maxPrice
                ? {
                      ...(minPrice && { gte: parseFloat(minPrice) }),
                      ...(maxPrice && { lte: parseFloat(maxPrice) })
                  }
                : undefined;
        const filters = {
            ...(city && { city }),
            ...(price && { price }),
            ...(propertyType && { propertyType })
        };
        return this.homeService.getHomes(filters);
    }

    @Get(':id')
    getHomeById(@Param('id', ParseIntPipe) id: number) {
        return this.homeService.getHomeById(id);
    }

    @Post()
    createHome(@Body() body: CreateHomeDto) {
        return this.homeService.createHome(body);
    }

    @Patch(':id')
    updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto
    ) {
        return this.homeService.updateHome(id, body);
    }

    @Delete(':id')
    deleteHome() {
        return 'done';
    }
}
