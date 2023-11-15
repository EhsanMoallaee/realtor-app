import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from './../prisma/prisma.service';
import { PropertyType } from '@prisma/client';

const mockGetHomes = [
    {
        id: 2,
        address: 'Ahmad Abad',
        city: 'Tehran',
        price: 2000000,
        propertyType: PropertyType.CONDO,
        image: 'img4',
        numberOfBedroomms: 2,
        numberOfBathroomms: 1,
        images: [{ url: 'img2' }]
    }
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
                            findMany: jest.fn().mockReturnValue(mockGetHomes)
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
});
