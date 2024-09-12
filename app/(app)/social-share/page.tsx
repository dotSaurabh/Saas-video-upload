'use client'
import React,{useEffect , useState , useRef} from 'react'
import { CldImage } from 'next-cloudinary';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type socialFormat = keyof typeof socialFormats

export default function social() {
   
  const [uploadedImage , setUploadedImage] = useState<string | null>(null)
  const [selectedFormat , setSelectedFormat] = useState<socialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false)
  const [isTransforming , setIsTransforming] = useState(false)
  const imageref = useRef<HTMLImageElement>(null)

  // use effect 
  useEffect(() => {
    if(uploadedImage){
      setIsTransforming(true);
    }
  
  }, [selectedFormat , uploadedImage])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]  // accessing the file from the input field 
    if(!file) return ;
    setIsUploading(true);
    const formData = new FormData();  // creating new formdata(which is used to send file or image etc)
    formData.append('file', file);  // appending the with name which is excepting in the backend 

    try {
       const reponse =  await fetch('/api/image-upload',{
        method: 'POST',
        body: formData
       })
       console.log(reponse)
       if(!reponse.ok) throw new Error ('failed to upload the image')
        const data = await reponse.json()
        setUploadedImage(data.publicId)
    } catch (error) {
      console.log(error);
      alert('failed to upload image')
      
    }
    finally{
      setIsUploading(false)
    }
  }

  const handleDownlaod = () => {
    // checking the current refence of image 
     if(!imageref.current) return 
    

     // logic for download the image 
     fetch(imageref.current.src)   //fetching the image 
     .then((response) => response.blob())  // It converts the response to a Blob object, which represents raw data.
     .then((blob) => {
       const url = window.URL.createObjectURL(blob)  //Creates a URL representing the Blob data.
       const link = document.createElement("a")  // Creates a new anchor (<a>) element.
       link.href = url; // Sets the href of the anchor to the Blob URL.
       link.download = `${selectedFormat
          .replace(/\s+/g, "_") // Sets the download attribute of the anchor.
          .toLowerCase()}.png`; //It uses the selectedFormat, replaces spaces with underscores, converts to lowercase, and adds ".png".
       document.body.appendChild(link); //Adds the anchor element to the document body.
       link.click()  //Programmatically clicks the link, triggering the download 
       document.body.removeChild(link) // Removes the link from the document body.
       window.URL.revokeObjectURL(url) // Releases the resources associated with the created URL.
      //  document.body.removeChild(link) // Removes the link from the document body.

     })
      
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Social Media Image Creator
      </h1>

      <div className="card">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload an Image</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Choose an image file</span>
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {uploadedImage && (
            <div className="mt-6">
              <h2 className="card-title mb-4">Select Social Media Format</h2>
              <div className="form-control">
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) =>
                    setSelectedFormat(e.target.value as socialFormat)
                  }
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 relative">
                <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}
                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadedImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity='auto'
                    ref={imageref}
                    onLoad={() => setIsTransforming(false)}
                    />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button className="btn btn-primary" onClick={handleDownlaod}>
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
