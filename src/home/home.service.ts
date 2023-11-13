import { PropertyType } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomeResponseDto } from './dtos/homeResponse.dto';

interface IGetHomeParams {
    city?: string;
    price?: {
        gte?: number;
        lte?: number;
    };
    PropertyType?: PropertyType;
}

interface ICreateHomeParams {
    address: string;
    numberOfBathrooms: number;
    numberOfBedrooms: number;
    city: string;
    price: number;
    landSize: number;
    propertyType: PropertyType;
    images: { url: string }[];
}

const homeSelect = {
    id: true,
    address: true,
    city: true,
    price: true,
    propertyType: true,
    number_of_bathrooms: true,
    number_of_bedrooms: true
};

@Injectable()
export class HomeService {
    constructor(private readonly prismaService: PrismaService) {}

    async getHomes(filters: IGetHomeParams): Promise<HomeResponseDto[]> {
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

    async getHomeById(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: { id },
            select: {
                ...homeSelect,
                images: {
                    select: {
                        url: true
                    }
                },
                realtor: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        if (!home) throw new NotFoundException();
        return new HomeResponseDto(home);
    }

    async createHome({
        address,
        numberOfBathrooms,
        numberOfBedrooms,
        city,
        price,
        landSize,
        propertyType,
        images
    }: ICreateHomeParams) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                price,
                land_size: landSize,
                propertyType,
                realtor_id: 2
            }
        });

        const homeImages = images.map((image) => {
            return { ...image, home_id: home.id };
        });

        await this.prismaService.image.createMany({
            data: homeImages
        });

        return new HomeResponseDto(home);
    }
}
