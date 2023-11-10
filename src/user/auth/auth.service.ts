import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';


interface ISignupParams {
    name: string;
    email: string;
    phone: string;
    password: string;
}

@Injectable()
export class AuthService {

    constructor(private readonly prismaService: PrismaService) {}

    async signup({name, email, phone, password}: ISignupParams) {
        const userExist = await this.prismaService.user.findFirst({
            where: { OR: [{email},{phone}] }
        })
        if(userExist) throw new ConflictException();

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prismaService.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: Role.BUYER
            }
        })
        return user;
    }
}
