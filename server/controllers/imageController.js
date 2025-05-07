import axios from "axios"
import userModel from "../models/userModel.js"
import FormData from "form-data"
import mongoose from "mongoose"


const generateImage = async (req, res) =>{
    try {

        const userId = req.userId;
        const { prompt } = req.body;

        console.log(req.userId,prompt)

        const user = await userModel.findById(userId)

        console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(userId));



        if(!user || !prompt){
            return res.json({ success: false, message: 'Missing Details' })
        }

        if(user.creditBalance === 0 || userModel.creditBalance < 0){
            return res.json({ success: false, message: 'No Credit Balance', creditBalance: user.creditBalance})
        }

        const formData = new FormData()
        formData.append('prompt', prompt )

        const{data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API,
                ...formData.getHeaders(),
              },
              responseType: 'arraybuffer'
        })

        const base64Image = Buffer.from(data, 'binary').toString('base64')
        const resultImage = `data:image/png;base64,${base64Image}`

        await userModel.findByIdAndUpdate(user._id, {creditBalance: user.creditBalance - 1})

        res.json({success: true, message: "Image Generated", creditBalance: user.creditBalance - 1, resultImage })


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export {generateImage};