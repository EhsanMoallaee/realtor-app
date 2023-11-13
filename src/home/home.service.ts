import { IRequestedUser } from './../user/decorator/user.decorator';
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

interface IUpdateHomeParams {
    address?: string;
    numberOfBathrooms?: number;
    numberOfBedrooms?: number;
    city?: string;
    price?: number;
    landSize?: number;
    propertyType?: PropertyType;
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

    async createHome(
        {
            address,
            numberOfBathrooms,
            numberOfBedrooms,
            city,
            price,
            landSize,
            propertyType,
            images
        }: ICreateHomeParams,
        userId: number
    ) {
        const home = await this.prismaService.home.create({
            data: {
                address,
                number_of_bathrooms: numberOfBathrooms,
                number_of_bedrooms: numberOfBedrooms,
                city,
                price,
                land_size: landSize,
                propertyType,
                realtor_id: userId
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

    async updateHome(id: number, data: IUpdateHomeParams) {
        const home = await this.prismaService.home.findUnique({
            where: { id }
        });
        if (!home) throw new NotFoundException();
        const updatedHome = await this.prismaService.home.update({
            where: { id },
            data: {
                city: data.city,
                price: data.price,
                address: data.address,
                propertyType: data.propertyType,
                number_of_bathrooms: data.numberOfBathrooms,
                number_of_bedrooms: data.numberOfBedrooms,
                land_size: data.landSize
            }
        });
        return new HomeResponseDto(updatedHome);
    }

    async deleteHome(id: number) {
        await this.prismaService.image.deleteMany({
            where: { home_id: id }
        });
        await this.prismaService.home.delete({ where: { id } });
    }

    async findRealtorByHomeId(id: number) {
        const home = await this.prismaService.home.findUnique({
            where: { id },
            select: {
                realtor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        if (!home) throw new NotFoundException();
        return home.realtor;
    }

    async inquire(homeId: number, buyer: IRequestedUser, message: string) {
        const realtor = await this.findRealtorByHomeId(homeId);
        return this.prismaService.message.create({
            data: {
                realtor_id: realtor.id,
                buyer_id: buyer.id,
                home_id: homeId,
                message
            }
        });
    }

    getHomeMessages(homeId: number) {
        return this.prismaService.message.findMany({
            where: { home_id: homeId },
            select: {
                id: true,
                message: true,
                buyer: {
                    select: {
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                home: {
                    select: {
                        id: true,
                        city: true,
                        address: true,
                        land_size: true,
                        price: true
                    }
                }
            }
        });
    }
}
