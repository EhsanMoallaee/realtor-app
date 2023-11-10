import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    signup(body) {
        console.log(body);
    }
}
