import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from './../prisma/prisma.service';
import { PropertyType } from '@prisma/client';

const mockGetHomes = [
    {
        id: 1,
        address: 'Ahmad Abad',
        city: 'Tehran',
        price: 2000000,
        property_type: PropertyType.CONDO,
        image: 'img4',
        number_of_bedroomms: 2,
        number_of_bathroomms: 1,
        images: [{ url: 'img2' }]
    }
];

const mockHome = {
    id: 1,
    address: 'Ahmad Abad',
    city: 'Tehran',
    price: 2000000,
    property_type: PropertyType.CONDO,
    image: 'img4',
    number_of_bedroomms: 2,
    number_of_bathroomms: 1,
    images: [{ url: 'img2' }]
};

const mockImages = [
    { id: 1, url: 'img1' },
    { id: 2, url: 'img2' }
];

describe('HomeService', () => {
    let service: HomeService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HomeService,
                {
                    provide: PrismaService,
                    useValue: {
                        home: {
                            findMany: jest.fn().mockReturnValue(mockGetHomes),
                            create: jest.fn().mockReturnValue(mockHome)
                        },
                        image: {
                            createMany: jest.fn().mockReturnValue(mockImages)
                        }
                    }
                }
            ]
        }).compile();

        service = module.get<HomeService>(HomeService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    describe('getHomes', () => {
        const filters = {
            city: 'Tehran',
            price: {
                gte: 1000000,
                lte: 2000000
            },
            propertyType: PropertyType.CONDO
        };

        it('Call prisma home.findMany with correct parameters', async () => {
            const mockPrismaFindManyHomes = jest
                .fn()
                .mockReturnValue(mockGetHomes);

            jest.spyOn(prismaService.home, 'findMany').mockImplementation(
                mockPrismaFindManyHomes
            );
            await service.getHomes(filters);
            expect(mockPrismaFindManyHomes).toBeCalledWith({
                select: {
                    ...homeSelect,
                    images: {
                        select: {
                            url: true
                        },
                        take: 1
                    }
                },
                where: filters
            });
        });

        it('Should threw not found exception if no homes are found', async () => {
            const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

            jest.spyOn(prismaService.home, 'findMany').mockImplementation(
                mockPrismaFindManyHomes
            );
            await expect(service.getHomes(filters)).rejects.toThrowError(
                NotFoundException
            );
        });
    });

    describe('Create home', () => {
        const mockCreateHomeParams = {
            address: 'Sajjad',
            numberOfBathrooms: 2,
            numberOfBedrooms: 2,
            city: 'Mashhad',
            price: 1400000,
            landSize: 100,
            propertyType: PropertyType.RESIDENTIAL,
            images: [{ url: 'img1' }]
        };
        it('Should call prisma home.create with the correct payload', async () => {
            const mockCreateHome = jest.fn().mockReturnValue(mockHome);

            jest.spyOn(prismaService.home, 'create').mockImplementation(
                mockCreateHome
            );

            await service.createHome(mockCreateHomeParams, 4);
            expect(mockCreateHome).toBeCalledWith({
                data: {
                    address: mockCreateHomeParams.address,
                    number_of_bathrooms: mockCreateHomeParams.numberOfBathrooms,
                    number_of_bedrooms: mockCreateHomeParams.numberOfBedrooms,
                    city: mockCreateHomeParams.city,
                    price: mockCreateHomeParams.price,
                    land_size: mockCreateHomeParams.landSize,
                    propertyType: mockCreateHomeParams.propertyType,
                    realtor_id: 4
                }
            });
        });

        it('Should call prisma image.createMany with the correct payload', async () => {
            const mockCreateManyImages = jest.fn().mockReturnValue(mockImages);

            jest.spyOn(prismaService.image, 'createMany').mockImplementation(
                mockCreateManyImages
            );
            await service.createHome(mockCreateHomeParams, 4);

            expect(mockCreateManyImages).toBeCalledWith({
                data: [{ url: 'img1', home_id: 1 }]
            });
        });
    });
});
