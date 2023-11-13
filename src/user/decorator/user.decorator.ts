import { createParamDecorator } from '@nestjs/common';

export const user = createParamDecorator(() => {
    return {};
});
