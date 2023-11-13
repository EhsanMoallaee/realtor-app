import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IRequestedUser {
    id: number;
    name: string;
    iat: number;
    exp: number;
}

export const RequsetedUser = createParamDecorator(
    (data, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        return request.user;
    }
);
