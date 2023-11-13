import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Query,
    Param,
    ParseIntPipe,
    Body,
    UnauthorizedException
} from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeResponseDto } from './dtos/homeResponse.dto';
import { PropertyType, Role } from '@prisma/client';
import { CreateHomeDto, UpdateHomeDto } from './dtos/home.dto';
import {
    IRequestedUser,
    RequsetedUser
} from 'src/user/decorator/user.decorator';
import { Roles } from '../decorators/roles.decorator';

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

    @Roles(Role.REALTOR)
    @Post()
    createHome(
        @Body() body: CreateHomeDto,
        @RequsetedUser() user: IRequestedUser
    ) {
        return 'Hi';
        return this.homeService.createHome(body, user.id);
    }

    @Roles(Role.REALTOR)
    @Patch(':id')
    async updateHome(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateHomeDto,
        @RequsetedUser() user: IRequestedUser
    ) {
        const realtor = await this.homeService.findRealtorByHomeId(id);
        if (realtor.id !== user.id) throw new UnauthorizedException();
        return this.homeService.updateHome(id, body);
    }

    @Roles(Role.REALTOR)
    @Delete(':id')
    async deleteHome(
        @Param('id', ParseIntPipe) id: number,
        @RequsetedUser() user: IRequestedUser
    ) {
        const realtor = await this.homeService.findRealtorByHomeId(id);
        if (realtor.id !== user.id) throw new UnauthorizedException();
        return this.homeService.deleteHome(id);
    }
}
