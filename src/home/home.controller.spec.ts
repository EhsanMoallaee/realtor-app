import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('HomeController', () => {
    let controller: HomeController;
    let homeService: HomeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HomeController],
            providers: [
                {
                    provide: HomeService,
                    useValue: {
                        getHomes: jest.fn().mockReturnValue([])
                    }
                },
                PrismaService
            ]
        }).compile();

        controller = module.get<HomeController>(HomeController);
        homeService = module.get<HomeService>(HomeService);
    });

    describe('getHomes', () => {
        it('Should construct filters object correctly', async () => {
            const mockGetHomes = jest.fn().mockReturnValue([]);
            jest.spyOn(homeService, 'getHomes').mockImplementation(
                mockGetHomes
            );
            await controller.getHomes('Mashhad', '1000000');

            expect(mockGetHomes).toBeCalledWith({
                city: 'Mashhad',
                price: {
                    gte: 1000000
                }
            });
        });
    });
});
