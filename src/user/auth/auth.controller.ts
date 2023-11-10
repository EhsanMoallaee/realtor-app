import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signup/:role')
    signup(@Body() body: SignupDto) {
        return this.authService.signup(body);
    }

    @Post('signin')
    signin(@Body() body: SigninDto) {
        return this.authService.signin(body);
    }

    @Post('key')
    generateProductKey(@Body() {email, role}: GenerateProductKeyDto) {
        return this.authService.generateProductKey(email, role);
    }
}
