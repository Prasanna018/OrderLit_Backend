import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_API_SECRETE
})

async function uploadImageCloudinary(image) {
    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())
    const uploadImage = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: "backend" }, (error, uploadResult) => {
            return resolve(uploadResult)
        }).end(buffer)

    })

    return uploadImage

}

export default uploadImageCloudinary
