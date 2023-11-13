import { PropertyType } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

interface GetHomeParams {
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    };
    PropertyType?: PropertyType;
}

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) {}

    async getHomes(filters: GetHomeParams): Promise<HomeResponseDto[]> {
        const homes = await this.prismaService.home.findMany({
            select: {
                id: true,
                address: true,
                city: true,
                price: true,
                propertyType: true,
                number_of_bathrooms: true,
                number_of_bedrooms: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                }
            },
            where: filters
        });
        if (homes.length === 0) throw new NotFoundException();
        return homes.map((home) => {
            const fetchedHome = { ...home, image: home.images[0].url };
            delete fetchedHome.images;
            return new HomeResponseDto(fetchedHome);
        });
    }
}
