export interface ClothingItem {
    clothing_id: string;
    clothing_type: string;
    color: string;
    material: string;
    style: string;
    extra_info: string;
    new_image_s3_key: string;
    image_url: string;
}

export interface ClosetResponse {
    items: ClothingItem[];
} 

export interface UserInfo {
    // TBD
    // Probably a mixture of Auth0 fields and clothing info from the DB 
}