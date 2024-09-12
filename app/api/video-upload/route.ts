import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient()


    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, //  when env can we used by client side then it should start with Next_public in next js 
        api_key: process.env.CLOUNDINARY_API_KEY,  
        api_secret: process.env.NEXT_PUBLIC_CLOUNDINARY_API_SECRET,  // Click 'View API Keys' above to copy your API secret
    });

    interface CloudinaryuploadResult {
        public_id : string,
        bytes : number,
        duration ?: number,
        [key: string]: any
    }

export async function POST(request : NextRequest) {

    try {

        // checkking for the username
        const {userId} = auth()

        if(!userId){
            return NextResponse.json({error : 'Unathorized '},{status : 401})
        }
         
        // checking the for the env variable 
        if(
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUNDINARY_API_KEY ||
            !process.env.NEXT_PUBLIC_CLOUNDINARY_API_SECRET
        ){
            return NextResponse.json({error:'cloundinary credential is not found'},{status : 500})
        }


        // fetching the data from the form data 
        const formData = await request.formData(); // fetching the form data 
        const file = formData.get('file') as File | null // the image from the form data
        const title = formData.get('title' ) as string
        const description = formData.get('description') as string
        const orginalSize = formData.get('orginalSize') as string

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
                {folder : "video-uploads",
                  resource_type :"video",
                  transformation : [
                    {
                        quality : "auto",
                        fetch_format : "mp4"
                    }
                  ]

                },
                (error , result) => {
                  if(error) reject(error)
                    else resolve(result as CloudinaryuploadResult)
                }
              )
              uploadStream.end(buffer)
            }
        )
         // creating the video object
        const video = await prisma.video.create({
            data : {
                title ,
                description ,
                orginalSize ,
                publicId : result.public_id,
                compressedSize : String(result.bytes),
                duration : result.duration || 0
            }      
        })
        
        return NextResponse.json(video)
    } catch (error) {
        console.log('error while uploading the video to cloundinary');
        return NextResponse.json(
            {
                error : 'upload video failed'
            },
            {
                status : 500
            }
        )
        
    }

  finally{
    // closing the coonection of the prisma
    await prisma.$disconnect()
  }

    
}