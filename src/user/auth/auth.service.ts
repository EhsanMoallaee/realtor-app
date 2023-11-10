import { ConflictException, UnauthorizedException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';


interface ISignupParams {
    name: string;
    email: string;
    phone: string;
    password: string;
}

interface ISigninParams {
    email: string;
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
        return this.generateJwtToken(user.id, name);
    }

    async signin({email, password}: ISigninParams) {
        const user = await this.prismaService.user.findUnique({
            where: {email}
        });

        if(!user) throw new UnauthorizedException('Invalid Credentials');

        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) throw new UnauthorizedException('Invalid Credentials');

        return this.generateJwtToken(user.id, user.name);
    }

    private generateJwtToken(id: number, name: string) {
        const payload = { id, name }
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 3600 * 2
        });
    }

    generateProductKey(email:string, role: Role) {
        const string = `${email}-${role}-${process.env.PRODUCT_KEY_SECRET}`;
        return bcrypt.hash(string, 10);
    }
}
