import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, //  when env can we used by client side then it should start with Next_public in next js 
        api_key: process.env.CLOUNDINARY_API_KEY,  
        api_secret: process.env.NEXT_PUBLIC_CLOUNDINARY_API_SECRET,  // Click 'View API Keys' above to copy your API secret
    });

    interface CloudinaryuploadResult {
        public_id : string;
        [key: string]: any
    }

export async function POST(request : NextRequest) {

    // fetching user id 
    const {userId} = auth()

    if(!userId){
        return NextResponse.json({error : 'Unathorized '},{status : 401})
    }
   
    try {
        const formData = await request.formData(); // fetching the form data 
        const file = formData.get('file') as File | null // the image from the form data

        if(!file){
            return NextResponse.json({error : 'No file provided'}, {status : 400})
        }
        
        // coverting the file in to array buffer 
        // use the same process for the image processes 
        const bytes = await file.arrayBuffer() 
        const buffer = Buffer.from(bytes)

         // uploading the image to cloundinary 
        const result = await new Promise<CloudinaryuploadResult>(
            (resolve , reject ) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {folder : "next-cloudinary-uploads"},
                (error , result) => {
                  if(error) reject(error)
                    else resolve(result as CloudinaryuploadResult)
                }
              )
              uploadStream.end(buffer)
            }
        )

        return NextResponse.json({
            publicId : result.public_id
        },{
            status : 200
        })
    } catch (error) {
        console.log('error while uploading the photo to cloundinary');
        return NextResponse.json(
            {
                error : 'upload image failed'
            },
            {
                status : 500
            }
        )
        
    }



    
}