import { Role } from '@prisma/client';
import {IsString, IsNotEmpty, IsEmail, IsStrongPassword, Matches, IsEnum, IsOptional} from 'class-validator';

export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Matches(/^09\d{9}$/, {message: "Phone number shold be a valid phone number format like: 09123456789"})
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsStrongPassword()
    password: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    productKey?: string;
}

export class SigninDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class GenerateProductKeyDto {
    @IsEmail()
    email: string;

    @IsEnum(Role)
    role: Role
}
