import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    ParseEnumPipe,
    UnauthorizedException
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';
import { Role } from '@prisma/client';
import { IRequestedUser, RequsetedUser } from '../decorator/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup/:role')
    async signup(
        @Body() body: SignupDto,
        @Param('role', new ParseEnumPipe(Role)) role: Role
    ) {
        if (role !== Role.BUYER) {
            if (!body.productKey) throw new UnauthorizedException();
            const validProductKey = `${body.email}-${role}-${process.env.PRODUCT_KEY_SECRET}`;
            const isValidProductKey = await bcrypt.compare(
                validProductKey,
                body.productKey
            );
            if (!isValidProductKey) throw new UnauthorizedException();
        }
        return this.authService.signup(body, role);
    }

    @Post('signin')
    signin(@Body() body: SigninDto) {
        return this.authService.signin(body);
    }

    @Post('key')
    generateProductKey(@Body() { email, role }: GenerateProductKeyDto) {
        return this.authService.generateProductKey(email, role);
    }

    @Get('me')
    me(@RequsetedUser() user: IRequestedUser) {
        return user;
    }
}
