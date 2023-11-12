import { Exclude, Expose } from 'class-transformer';
import { propertyType } from '@prisma/client';

export class HomeResponseDto {
    id: number;
    address: string;

    @Exclude()
    number_of_bedrooms: number;

    @Expose({ name: 'numberOfBedroomms' })
    numberOfBeddrooms() {
        return this.number_of_bedrooms;
    }

    @Exclude()
    number_of_bathrooms: number;
    @Expose({ name: 'numberOfBathroomms' })
    numberOfBathrooms() {
        return this.number_of_bathrooms;
    }

    city: string;

    @Exclude()
    listed_date: Date;
    @Expose({ name: 'listedDate' })
    listedDate() {
        return this.listed_date;
    }

    price: number;
    image: string;

    @Exclude()
    land_size: number;
    @Expose({ name: 'landSize' })
    landSize() {
        return this.land_size;
    }

    propertyType: propertyType;
    @Exclude()
    created_at: Date;
    @Exclude()
    updated_at: Date;
    @Exclude()
    realtor_id: number;

    constructor(partial: Partial<HomeResponseDto>) {
        Object.assign(this, partial);
    }
}
